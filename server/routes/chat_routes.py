from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from services.auth_service import decode_jwt

bp_chat = Blueprint("chat", __name__)

@bp_chat.route("/api/conversation", methods=["GET"])
def get_conversation():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing token"}), 401

    token = auth_header.split(" ", 1)[1]
    payload = decode_jwt(
        token=token,
        secret=current_app.config["JWT_SECRET"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )
    user_id = payload["sub"]

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    cursor = (
        current_app.db.conversations.find({"user_id": user_id})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    conversations = [] 
    for doc in cursor: doc["_id"] = str(doc["_id"])
     # convert ObjectId to string 
    conversations.append(doc)

    total_count = current_app.db.conversations.count_documents({"user_id": user_id})
    total_pages = (total_count + limit - 1) // limit

    return jsonify({
        "messages": conversations,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "total_count": total_count
        }
    })
