import datetime

class ConversationService:
    def __init__(self, db):
        self.collection = db["conversations"]

    def save_conversation(self, user_prompt, ai_response, source="ollama", user_id=None):
        doc = {
            "user_prompt": user_prompt,
            "ai_response": ai_response,
            "source": source,  # "ollama" or "fallback"
            "timestamp": datetime.datetime.utcnow()
        }
        if user_id is not None:
            doc["user_id"] = user_id

        self.collection.insert_one(doc)
        return doc
