from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
from routes.ollama_routes import bp
from routes.health_check import bp_health
from routes.location_routes import bp_location
from routes.live_recommendation_routes import bp_recommend
from routes.manual_recommendation_routes import bp_manual
from routes.recommendation_history_routes import bp_recommend_history
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.chat_routes import bp_chat
from Schema.user_schema import ensure_user_indexes
from services.ollama_service import OllamaService



OLLAMA = OllamaService()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)


    # CORS for local dev (React dev server)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Mongo
    client = MongoClient(app.config["MONGO_URI"])
    # If your URI includes a DB name, get_default_database works; else fallback:
    client = MongoClient(app.config["MONGO_URI"])

    db = client.get_default_database()
    if db is None:
      db = client["Crop_recommendation_db"]

    app.db = db


    ensure_user_indexes(app.db.users)

    
    app.register_blueprint(bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(bp_chat)
    app.register_blueprint(bp_health)
    app.register_blueprint(bp_location)
    app.register_blueprint(bp_recommend)
    app.register_blueprint(bp_manual) 
    app.register_blueprint(bp_recommend_history)
    

    
    # ollama service
    OLLAMA.check_status()
    print(f"\n Server: http://localhost:5000")
    print(f" Ollama AI: { 'ENABLED' if OLLAMA.enabled else ' DISABLED '}")

    if OLLAMA.enabled:
       print(f" Model: { OLLAMA.model}")
       print(f" Status: Ready to answer any of your question!")
    else:
       print(" To enable AI")   
       print(" 1. Install: https://ollama.com")   
       print(f" 2. Run: ollama pull { OLLAMA.model}")   
       print(" 3. Run: ollama serve")

    return app

app = create_app()

if __name__ == "__main__":
    port = int(Config.PORT)
    app.run(debug=True, port=port)

       

