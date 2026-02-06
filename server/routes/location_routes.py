from flask import Blueprint, jsonify, current_app
from services.location_service import LocationService

bp_location = Blueprint("location", __name__, url_prefix="/api")

@bp_location.route("/location", methods=["GET"])
def detect_location():
    """Detect current location and save to DB"""
    try:
        service = LocationService(current_app.db)
        lat, lon, city, country = service.get_current_location()
        doc = service.save_location(lat, lon, city, country)

        return jsonify({
            "success": True,
            "location": {
                "latitude": doc["latitude"],
                "longitude": doc["longitude"],
                "city": doc["city"],
                "country": doc["country"],
                "timestamp": doc["timestamp"]
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
