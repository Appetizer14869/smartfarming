from flask import Blueprint, request, jsonify, current_app
from services.live_recommendation_service import RecommendationService
from services.location_service import LocationService
from config import Config

bp_recommend = Blueprint("recommend", __name__, url_prefix="/api/recommend")

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@bp_recommend.route("/live", methods=["POST"])
def recommend_live():
    try:
        data = request.json
        N = float(data.get("N"))
        P = float(data.get("P"))
        K = float(data.get("K"))
        ph = float(data.get("ph"))

        # Location
        if data.get("useCurrentLocation", True):
            lat, lon, city, country = LocationService(current_app.db).get_current_location()
        else:
            lat = float(data.get("latitude", 30.9))
            lon = float(data.get("longitude", 75.8))
            city = data.get("city", "Unknown")
            country = data.get("country", "Unknown")

        # Recommendation
        service = RecommendationService(current_app.db)
        result = service.recommend_crop_live(N, P, K, ph, lat, lon, Config.API_KEY)

        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 400

        # Save to DB
        doc = service.save_recommendation(result, city, country, lat, lon)

        # Convert ObjectId to string
        doc = serialize_doc(doc)

        return jsonify({"success": True, "recommendation": doc}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@bp_recommend.route("live/history", methods=["GET"])
def recommend_history():
    """
    This will fetch all past crop recommendations from my mongo database
    """
    try:
        service = RecommendationService(current_app.db) 

        # filter from query parameters
        crop = request.args.get("crop") 
        city = request.args.get("city") 
        country = request.args.get("country") 
        query = {} 
        if crop: query["recommended_crop"] = crop 
        if city: query["location.city"] = city 
        if country: query["location.country"] = country
        
        docs = list(service.collection.find(query).sort("timestamp", -1)) 
        
        # Serialize all docs 
        docs = [serialize_doc(doc) for doc in docs] 
        
        return jsonify({"success": True, "history": docs}), 200 
    except Exception as e: 
        return jsonify({"success": False, "error": str(e)}), 500