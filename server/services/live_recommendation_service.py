import datetime
import pandas as pd
import joblib
import os
from api.weather_api import get_weather_and_rainfall

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(BASE_DIR, "model", "crop_recommendation_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, "model", "label_encoder.pkl")

try:
    best_rf = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    print("✅ Live Crop model, scaler, and label encoder loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model/scaler/label encoder: {e}")
    best_rf, scaler, label_encoder = None, None, None


class RecommendationService:
    def __init__(self, db):
        self.collection = db["live_recommendations"]

    def recommend_crop_live(self, N, P, K, ph, lat, lon, api_key, iot_sensor_data=None):
        if best_rf is None or scaler is None:
            return {"error": "Model or scaler not loaded properly."}

        # Use IoT sensor data if available
        if iot_sensor_data:
            N = iot_sensor_data.get("N", N)
            P = iot_sensor_data.get("P", P)
            K = iot_sensor_data.get("K", K)
            ph = iot_sensor_data.get("ph", ph)
            soil_data_source = "IoT Sensors"
        else:
            soil_data_source = "Manual Input"

        # Fetch weather data
        temp, humidity, rainfall = get_weather_and_rainfall(lat, lon, api_key)
        if temp is None or humidity is None:
            return {"error": "Failed to fetch weather data."}

        # Prepare features
        features = pd.DataFrame(
            [[N, P, K, temp, humidity, ph, rainfall]],
            columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
        )

        try:
            scaled_features = scaler.transform(features)
            prediction = best_rf.predict(scaled_features)
            recommended_crop = (
                label_encoder.inverse_transform(prediction)[0]
                if label_encoder
                else int(prediction[0])
            )
        except Exception as e:
            return {"error": f"Prediction failed: {e}"}

        result = {
            "recommended_crop": recommended_crop,
            "temperature": round(temp, 2),
            "humidity": round(humidity, 2),
            "rainfall": round(rainfall, 2),
            "mode": "LIVE",
            "soil_data_source": soil_data_source,
            "weather_data_source": "Live APIs (OpenWeather + NASA)",
            "input_data": {"N": N, "P": P, "K": K, "ph": ph},
        }

        return result

    def save_recommendation(self, result, city, country, lat, lon):
        doc = {
            "recommended_crop": result["recommended_crop"],
            "temperature": result["temperature"],
            "humidity": result["humidity"],
            "rainfall": result["rainfall"],
            "soil_data_source": result["soil_data_source"],
            "weather_data_source": result["weather_data_source"],
            "input_data": result["input_data"],
            "location": {
                "city": city,
                "country": country,
                "latitude": lat,
                "longitude": lon,
            },
            "timestamp": datetime.datetime.utcnow(),
        }
        self.collection.insert_one(doc)
        return doc
