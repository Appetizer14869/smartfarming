from flask import Blueprint, request, jsonify, current_app
from services.farm_guide_service import FarmGuideService

bp_farm_guide = Blueprint("farm_guide", __name__, url_prefix="/api/farm_guide")

@bp_farm_guide.route("/", methods=["GET"])
def get_all_farming_guides():
    """Route to get all farming guides from MongoDB"""
    try:
        service = FarmGuideService(current_app.db)
        guides = service.get_all_farming_guides()
        if "error" in guides:
            return jsonify({"success": False, "error": guides["error"]}), 400
        return jsonify({"success": True, "farm_guides": guides}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Backend route to get farming guide by crop
@bp_farm_guide.route("/<crop>", methods=["GET"])
def get_farming_guide_by_crop(crop):
    """Route to get a farming guide for a specific crop from MongoDB"""
    try:
        service = FarmGuideService(current_app.db)
        guide = service.get_farming_guide_by_crop(crop)
        if "error" in guide:
            return jsonify({"success": False, "error": guide["error"]}), 400
        return jsonify({"success": True, "farming_guide": guide}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@bp_farm_guide.route("/insert", methods=["POST"])
def insert_farming_guides():
    """Route to insert farming guides from the CSV into MongoDB"""
    try:
        service = FarmGuideService(current_app.db)
        result = service.save_all_farming_guides()
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 400
        return jsonify({"success": True, "message": result["message"]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
