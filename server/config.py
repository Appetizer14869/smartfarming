import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    PORT= os.getenv("PORT")
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=JWT_EXPIRES_MINUTES)

    
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    API_KEY = os.getenv("OPENWEATHER_API_KEY")

