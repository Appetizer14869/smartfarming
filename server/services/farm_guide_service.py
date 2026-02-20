import datetime
import pandas as pd

class FarmGuideService:
    def __init__(self, db):
        self.collection = db["farm_guides"]  # MongoDB collection for farming guides

    def clean_data(self, data):
        """Clean any unnecessary quotes and format the data properly"""
        if isinstance(data, str):
            # Strip leading and trailing spaces, and remove extra quotes around the text
            data = data.strip().replace('"', '').replace("'", '')
        return data

    def save_all_farming_guides(self):
        """Save all farming guides into the MongoDB collection from CSV file"""
        try:
            # Read the farming guide CSV file
            df = pd.read_csv('data/Farming_guide.csv')  # Adjust path if needed
            
            # Clean the data by applying the clean_data method to each column
            for column in df.columns:
                df[column] = df[column].apply(self.clean_data)

            # Convert the DataFrame to a dictionary
            farming_guides = df.to_dict(orient="records")
            
            # Insert all farming guides into the MongoDB collection
            result = self.collection.insert_many(farming_guides)
            
            return {"success": True, "message": f"Inserted {len(result.inserted_ids)} farming guides."}
        except Exception as e:
            return {"error": f"Failed to insert farming guides: {e}"}

    def get_all_farming_guides(self):
        """Retrieve all farming guides from the MongoDB collection"""
        try:
            # Retrieve all documents from the collection
            guides = list(self.collection.find())
            for guide in guides:
                guide["_id"] = str(guide["_id"])  # Convert MongoDB _id to string
            return guides
        except Exception as e:
            return {"error": f"Failed to retrieve farming guides: {e}"}

    def get_farming_guide_by_crop(self, crop):
        """Retrieve a farming guide for a specific crop from MongoDB collection"""
        try:
            # Case-insensitive query to find the crop (e.g., "maize" or "Maize")
            guide = self.collection.find_one({"Crop": {"$regex": f"^{crop}$", "$options": "i"}})

            if guide:
                guide["_id"] = str(guide["_id"])  # Convert MongoDB _id to string
                return guide
            
            return {"error": "Farming guide not found for this crop."}
        except Exception as e:
            return {"error": f"Failed to retrieve farming guide for {crop}: {e}"}