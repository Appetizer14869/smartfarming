from flask import Blueprint, jsonify, current_app
from config import Config

bp_health = Blueprint("health", __name__, url_prefix="/api")

@bp_health.route("/health", methods=["GET"])
def health_check():
    # Check MongoDB connection
    mongo_status = False
    try:
        # Ping the database
        current_app.db.command("ping")
        mongo_status = True
    except Exception:
        mongo_status = False

    return jsonify({
        "Server": f"the server is running on Port {Config.PORT}",
        "status": "ok",
        "service": "crop-backend",
        "mongodb": " CONNECTED" if mongo_status else " DISCONNECTED",
    }), 200
