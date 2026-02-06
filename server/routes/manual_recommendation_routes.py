from flask import Blueprint, request, jsonify, current_app
from services.manual_recommendation_service import ManualRecommendationService

bp_manual = Blueprint("manual_recommend", __name__, url_prefix="/api/recommend")

def serialize_doc(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@bp_manual.route("/manual", methods=["POST"])
def recommend_manual():
    try:
        data = request.json
        N = float(data.get("N"))
        P = float(data.get("P"))
        K = float(data.get("K"))
        temperature = float(data.get("temperature"))
        humidity = float(data.get("humidity"))
        ph = float(data.get("ph"))
        rainfall = float(data.get("rainfall"))

        service = ManualRecommendationService(current_app.db)
        result = service.recommend_crop_manual(N, P, K, temperature, humidity, ph, rainfall)

        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 400

        doc = service.save_recommendation(result)
        doc = serialize_doc(doc)

        return jsonify({"success": True, "recommendation": doc}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_manual.route("/manual/history", methods=["GET"])
def manual_history():
    """Fetch manual recommendations with optional filters"""
    try:
        service = ManualRecommendationService(current_app.db)

        # Filters from query params
        crop = request.args.get("crop")
        city = request.args.get("city")
        country = request.args.get("country")
        start = request.args.get("start")  # e.g. 2026-02-01
        end = request.args.get("end")      # e.g. 2026-02-04

        query = {}
        if crop:
            query["recommended_crop"] = crop
        if city:
            query["location.city"] = city
        if country:
            query["location.country"] = country

        # Date range filter
        if start or end:
            query["timestamp"] = {}
            if start:
                from datetime import datetime
                query["timestamp"]["$gte"] = datetime.fromisoformat(start)
            if end:
                from datetime import datetime
                query["timestamp"]["$lte"] = datetime.fromisoformat(end)

        docs = list(service.collection.find(query).sort("timestamp", -1))
        docs = [serialize_doc(doc) for doc in docs]

        return jsonify({"success": True, "history": docs}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
