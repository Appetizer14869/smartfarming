import requests
import time
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
from routes.health_check import bp_health
from routes.location_routes import bp_location
from routes.live_recommendation_routes import bp_recommend
from routes.manual_recommendation_routes import bp_manual
from routes.recommendation_history_routes import bp_recommend_history
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.chatbot_route import bp_chatbot
from routes.farm_guide_routes import bp_farm_guide
from Schema.user_schema import ensure_user_indexes
import threading



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS for local dev (React dev server)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Mongo
    client = MongoClient(app.config["MONGO_URI"])
    db = client.get_default_database()
    if db is None:
      db = client["Crop_recommendation_db"]

    app.db = db

    ensure_user_indexes(app.db.users)

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(bp_chatbot)
    app.register_blueprint(bp_health)
    app.register_blueprint(bp_location)
    app.register_blueprint(bp_recommend)
    app.register_blueprint(bp_manual) 
    app.register_blueprint(bp_recommend_history)
    app.register_blueprint(bp_farm_guide)

    # Check and seed farming guides data after the app is fully running
    threading.Timer(5.0, seed_farming_guides_data_if_needed).start()


    return app

def seed_farming_guides_data_if_needed():
    """Check if farming guide data exists in DB, and seed it if empty"""
    try:
        # Check if any records exist in the `farm_guides` collection
        farm_guide_collection = app.db["farm_guides"]
        if farm_guide_collection.count_documents({}) == 0:
            print("No farming guides found in the database. Seeding data...")
            
            # Send a POST request to the /api/farm_guide/insert endpoint to seed data
            response = requests.post("http://localhost:5000/api/farm_guide/insert")
            
            if response.status_code == 200:
                print("Farming guides data seeded successfully.")
            else:
                print(f"Failed to seed farming guides data: {response.text}")
        else:
            print("Farming guides data already exists in the database. Skipping seeding.")
    except Exception as e:
        print(f"Error seeding data: {e}")

app = create_app()

if __name__ == "__main__":
    port = int(Config.PORT)
    app.run(debug=True, port=port)
