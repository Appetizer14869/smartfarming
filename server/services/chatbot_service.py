from services.farm_guide_service import FarmGuideService

class ChatbotService:
    def __init__(self, db):
        self.collection = db["farm_guides"]  # MongoDB collection for farming guides
        self.farm_guide_service = FarmGuideService(db)

    def get_farming_guide_by_crop(self, crop_name):
        """Retrieve only the introduction of the farming guide for the specified crop"""
        try:
            # Normalize the crop name to lowercase for case-insensitive search
            normalized_crop_name = crop_name.strip().lower()
            
            guide = self.farm_guide_service.get_farming_guide_by_crop(normalized_crop_name)
            if guide.get("error"):
                return guide  # Return error if the crop guide is not found
            
            # Return only the introduction of the crop guide
            return {"Introduction": guide.get("Introduction", "Introduction not available")}
        except Exception as e:
            return {"error": f"Failed to retrieve farming guide: {str(e)}"}