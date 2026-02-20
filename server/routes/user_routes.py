from flask import Blueprint, request, jsonify, current_app
from services.auth_service import decode_jwt, create_jwt
import jwt as pyjwt
from datetime import datetime, timezone
from bson.objectid import ObjectId

user_bp = Blueprint("user", __name__)


def get_bearer_token():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


def require_auth():
    token = get_bearer_token()
    if not token:
        return None, (jsonify({"message": "Missing Authorization Bearer token"}), 401)

    try:
        payload = decode_jwt(
            token=token,
            secret=current_app.config["JWT_SECRET"],
            algorithm=current_app.config["JWT_ALGORITHM"],
        )
        return payload, None
    except pyjwt.ExpiredSignatureError:
        return None, (jsonify({"message": "Token expired"}), 401)
    except pyjwt.InvalidTokenError:
        return None, (jsonify({"message": "Invalid token"}), 401)


@user_bp.get("/api/me")
def me():
    payload, err = require_auth()
    if err:
        return err

    user = current_app.db.users.find_one(
        {"_id": ObjectId(payload["sub"])},
        {"passwordHash": 0}  # exclude password
    )

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "message": "Authenticated",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"],
            "role": user.get("role", "user"),
            "createdAt": user["createdAt"].isoformat() if user.get("createdAt") else None,
            "updatedAt": user["updatedAt"].isoformat() if user.get("updatedAt") else None,
            "settings": user.get("settings", {})
        }
    }), 200


@user_bp.put("/api/me/update")
def update_me():
    payload, err = require_auth()
    if err:
        return err

    data = request.get_json() or {}
    users = current_app.db.users

    update_fields = {}

    if "email" in data:
        update_fields["email"] = data["email"]

    if "username" in data:
        update_fields["username"] = data["username"]

    # Always update updatedAt
    update_fields["updatedAt"] = datetime.now(timezone.utc)

    result = users.update_one(
        {"_id": ObjectId(payload["sub"])},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        return jsonify({"success": False, "message": "No changes made"}), 200

    updated_user = users.find_one({"_id": ObjectId(payload["sub"])})

    # Generate new token
    new_token = create_jwt(
        {
            "sub": str(updated_user["_id"]),
            "email": updated_user["email"],
            "username": updated_user["username"],
            "role": updated_user.get("role", "user"),
        },
        current_app.config["JWT_SECRET"],
        current_app.config["JWT_ALGORITHM"],
        expires_minutes=30
    )

    return jsonify({
        "success": True,
        "message": "Profile updated",
        "user": {
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "username": updated_user["username"],
            "role": updated_user.get("role", "user"),
            "createdAt": updated_user["createdAt"].isoformat() if updated_user.get("createdAt") else None,
            "updatedAt": updated_user["updatedAt"].isoformat() if updated_user.get("updatedAt") else None,
        },
        "token": new_token
    }), 200


@user_bp.post("/api/analytics/save")
def save_filtered_results():
    payload, err = require_auth()
    if err:
        return err

    data = request.get_json() or {}

    doc = {
        "user_id": payload["sub"],
        "filters": data.get("filters", {}),
        "results": data.get("results", []),
        "timestamp": datetime.now(timezone.utc),
    }

    current_app.db.analytics_queries.insert_one(doc)

    return jsonify({"success": True, "message": "Analytics query saved"}), 201


@user_bp.get("/api/analytics/saved")
def get_saved_queries():
    payload, err = require_auth()
    if err:
        return err

    queries = list(current_app.db.analytics_queries.find({"user_id": payload["sub"]}))

    for q in queries:
        q["_id"] = str(q["_id"])
        q["timestamp"] = q["timestamp"].isoformat() if q.get("timestamp") else None

    return jsonify({"success": True, "queries": queries}), 200


@user_bp.delete("/api/analytics/saved/<query_id>")
def delete_saved_query(query_id):
    payload, err = require_auth()
    if err:
        return err

    result = current_app.db.analytics_queries.delete_one({
        "_id": ObjectId(query_id),
        "user_id": payload["sub"]
    })

    if result.deleted_count == 1:
        return jsonify({"success": True, "message": "Query deleted"}), 200

    return jsonify({"success": False, "message": "Query not found"}), 404


@user_bp.delete("/api/analytics/saved/all")
def clear_all_saved_queries():
    payload, err = require_auth()
    if err:
        return err

    current_app.db.analytics_queries.delete_many({"user_id": payload["sub"]})

    return jsonify({"success": True, "message": "All queries cleared"}), 200


@user_bp.post("/api/user/settings")
def update_settings():
    payload, err = require_auth()
    if err:
        return err

    data = request.get_json() or {}

    current_app.db.users.update_one(
        {"_id": ObjectId(payload["sub"])},
        {"$set": {"settings": data}}
    )

    return jsonify({"success": True, "message": "Settings updated"}), 200



@user_bp.delete("/api/user/account")
def delete_account():
    payload, err = require_auth()
    if err:
        return err

    current_app.db.users.delete_one({"_id": ObjectId(payload["sub"])})
    current_app.db.analytics_queries.delete_many({"user_id": payload["sub"]})

    return jsonify({"success": True, "message": "Account deleted"}), 200