from flask import Blueprint, jsonify, request, current_app
from services.ollama_service import OllamaService
from services.conversation_service import ConversationService
from services.auth_service import decode_jwt  # use your existing JWT decode

bp = Blueprint("main", __name__)
ollama = OllamaService()
ollama.check_status()

@bp.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "ok",
        "service": "crop-backend",
        "ollama_ai": ollama.enabled,
        "model": ollama.model if ollama.enabled else None
    }), 200

@bp.route("/api/chat", methods=["POST"])
def query_ollama():
    """
    Universal Chatbot endpoint - accepts ANY user prompt
    Uses Ollama AI to answer ANY question
    Falls back to TF-IDF only if Ollama is unavailable
    """
    data = request.get_json()
    user_prompt = data.get("prompt")

    # Query Ollama
    response = ollama.query(user_prompt)

    # Extract user_id from JWT
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_jwt(
                token=token,
                secret=current_app.config["JWT_SECRET"],
                algorithm=current_app.config["JWT_ALGORITHM"],
            )
            user_id = payload.get("sub")
        except Exception:
            user_id = None

    # Save conversation with user_id
    conv_service = ConversationService(current_app.db)
    source = "ollama" if ollama.enabled else "fallback"
    conv_service.save_conversation(user_prompt, response, source, user_id=user_id)

    return jsonify({"response": response, "source": source}), 200
