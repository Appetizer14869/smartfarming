import datetime
import pandas as pd
import joblib
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(BASE_DIR, "model", "crop_recommendation_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, "model", "label_encoder.pkl")

try:
    best_rf = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    print("✅ Manual recommendation model, scaler, and encoder loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model/scaler/label encoder: {e}")
    best_rf, scaler, label_encoder = None, None, None


class ManualRecommendationService:
    def __init__(self, db):
        self.collection = db["manual_recommendations"]

    def recommend_crop_manual(self, N, P, K, temperature, humidity, ph, rainfall):
        if best_rf is None or scaler is None:
            return {"error": "Model or scaler not loaded properly."}

        # Prepare features
        features = pd.DataFrame(
            [[N, P, K, temperature, humidity, ph, rainfall]],
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
            "temperature": round(temperature, 2),
            "humidity": round(humidity, 2),
            "rainfall": round(rainfall, 2),
            "mode": "MANUAL",
            "soil_data_source": "Manual Input",
            "weather_data_source": "Manual Input",
            "input_data": {"N": N, "P": P, "K": K, "ph": ph},
        }

        return result

    def save_recommendation(self, result):
        doc = {
            **result,
            "timestamp": datetime.datetime.utcnow(),
        }
        self.collection.insert_one(doc)
        return doc
