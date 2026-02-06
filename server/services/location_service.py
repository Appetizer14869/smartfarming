import requests
import datetime

class LocationService:
    def __init__(self, db):
        self.collection = db["locations"]

    def get_current_location(self):
        """
        Detect current location using IP-based geolocation.
        Falls back to Mombasa, Kenya if detection fails.
        """
        try:
            # Try ipapi.co first
            response = requests.get("https://ipapi.co/json/", timeout=5)
            data = response.json()

            lat = data.get("latitude")
            lon = data.get("longitude")
            city = data.get("city", "Unknown")
            country = data.get("country_name", "Unknown")

            if lat and lon:
                return lat, lon, city, country
            else:
                raise ValueError("Invalid location data received")
        except:
            try:
                # Fallback to ip-api.com
                response = requests.get("http://ip-api.com/json/", timeout=5)
                data = response.json()

                if data.get("status") == "success":
                    lat = data.get("lat")
                    lon = data.get("lon")
                    city = data.get("city", "Unknown")
                    country = data.get("country", "Unknown")
                    return lat, lon, city, country
            except:
                pass

            # Final fallback
            return 4.0435, 39.6682, "Mombasa", "Kenya"

    def save_location(self, lat, lon, city, country):
        """Save detected location into MongoDB"""
        doc = {
            "latitude": lat,
            "longitude": lon,
            "city": city,
            "country": country,
            "timestamp": datetime.datetime.utcnow()
        }
        self.collection.insert_one(doc)
        return doc
