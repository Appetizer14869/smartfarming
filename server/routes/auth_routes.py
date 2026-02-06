from flask import Blueprint, request, jsonify, current_app
from pymongo.errors import DuplicateKeyError
from utils.validators import validate_registration, validate_login
from services.auth_service import hash_password, verify_password, create_jwt

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    errors = validate_registration(data)
    if errors:
        return jsonify({"message": "Validation error", "errors": errors}), 400

    users = current_app.db.users

    user_doc = {
        "username": data["username"],
        "email": data["email"],
        "passwordHash": hash_password(data["password"]),
    }

    try:
        users.insert_one(user_doc)
    except DuplicateKeyError:
        # Could be username or email
        return jsonify({"message": "Username or email already exists"}), 409

    return jsonify({"message": "Registration successful"}), 201


@auth_bp.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    errors = validate_login(data)
    if errors:
        return jsonify({"message": "Validation error", "errors": errors}), 400

    users = current_app.db.users
    user = users.find_one({"email": data["email"]})

    if not user or not verify_password(data["password"], user.get("passwordHash", "")):
        return jsonify({"message": "Invalid email or password"}), 401

    token = create_jwt(
        payload={"sub": str(user["_id"]), "email": user["email"], "username": user["username"]},
        secret=current_app.config["JWT_SECRET"],
        algorithm=current_app.config["JWT_ALGORITHM"],
        expires_minutes=current_app.config["JWT_EXPIRES_MINUTES"],
    )

    # If you want HttpOnly cookies instead of localStorage, see README notes below.
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"username": user["username"], "email": user["email"]}
    }), 200


@auth_bp.post("/api/logout")
def logout():
    # Stateless JWT logout: client discards token.
    # If you want server-side revocation, add a token blacklist collection.
    return jsonify({"message": "Logged out"}), 200
