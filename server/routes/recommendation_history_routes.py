from flask import Blueprint, request, jsonify, current_app
from services.live_recommendation_service import RecommendationService
from services.manual_recommendation_service import ManualRecommendationService

bp_recommend_history = Blueprint("recommend_history", __name__, url_prefix="/api/combined")

def serialize_doc(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@bp_recommend_history.route("/history", methods=["GET"])
def combined_history():
    """Fetch combined history of live + manual recommendations with filters"""
    try:
        live_service = RecommendationService(current_app.db)
        manual_service = ManualRecommendationService(current_app.db)

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
            from datetime import datetime
            if start:
                query["timestamp"]["$gte"] = datetime.fromisoformat(start)
            if end:
                query["timestamp"]["$lte"] = datetime.fromisoformat(end)

        # Fetch from both collections
        live_docs = list(live_service.collection.find(query).sort("timestamp", -1))
        manual_docs = list(manual_service.collection.find(query).sort("timestamp", -1))

        # Serialize
        all_docs = [serialize_doc(doc) for doc in live_docs + manual_docs]

        # Sort combined list by timestamp descending
        all_docs.sort(key=lambda d: d["timestamp"], reverse=True)

        return jsonify({"success": True, "history": all_docs}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
