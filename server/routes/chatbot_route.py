from flask import Blueprint, request, jsonify, current_app
from services.chatbot_service import ChatbotService

bp_chatbot = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")

@bp_chatbot.route("/ask", methods=["POST"])
def ask():
    """Handle user query and return crop information"""
    try:
        # Extract the user query from the request
        user_query = request.json.get("query", "").strip().lower()
        
        if not user_query:
            return jsonify({"success": False, "error": "No query provided"}), 400
        
        # Process the query to extract the crop name (e.g., "What is Maize?")
        crop_name = user_query.split("what is ")[-1] if "what is " in user_query else user_query

        service = ChatbotService(current_app.db)
        guide = service.get_farming_guide_by_crop(crop_name)
        
        if "error" in guide:
            return jsonify({"success": False, "error": guide["error"]}), 400
        
        # Return the introduction of the crop
        return jsonify({
            "success": True,
            "crop": crop_name.capitalize(),  # Capitalize crop name for better readability
            "introduction": guide["Introduction"]
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500