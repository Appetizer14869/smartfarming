import os
import logging
import requests
import pandas as pd
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b") 

class OllamaService: 
    def __init__(self, api_url=None, model=None): 
        self.api_url = api_url or OLLAMA_API_URL 
        self.model = model or OLLAMA_MODEL 
        self.enabled = False  # will be set after check_status()

        # Load fallback chatbot data
        self.questions, self.answers, self.vectorizer, self.tfidf_matrix = self._load_fallback_data()

    def _load_fallback_data(self):
        try:
            csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "chatbot_data.csv")
            df = pd.read_csv(csv_path)
            questions = df["question"].tolist()
            answers = df["answer"].tolist()
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform(questions)
            logging.info("✅ Chatbot fallback data loaded successfully.")
            return questions, answers, vectorizer, tfidf_matrix
        except Exception as e:
            logging.warning(f"⚠️ Could not load chatbot fallback data: {e}")
            return [], [], None, None

    def check_status(self):
        try:
            response = requests.get(f"{self.api_url}/api/tags", timeout=2)
            response.raise_for_status()
            models = [m["name"] for m in response.json().get("models", [])]

            if self.model in models:
                self.enabled = True
                logging.info(f"Ollama initialized with model: {self.model}")
                return True
            logging.warning(f"Model '{self.model}' not found. Available: {models}")
            return False
        except Exception as e:
            logging.warning(f"Ollama status check failed: {e}")
            return False

    def query(self, user_prompt):
        """Query Ollama if enabled, else fallback to TF-IDF chatbot."""
        if self.enabled:
            try:
                system_instruction = """You are a helpful AI assistant. Answer any question the user asks in a clear, accurate, and friendly way. 
        
Be concise but thorough. If you don't know something, say so honestly. Always be respectful and helpful. """
                payload = {
                    "model": self.model,
                    "prompt": user_prompt,
                    "system": system_instruction,
                    "stream": False,
                    "options": {
                        "temperature": 0.7, 
                        "top_p": 0.9, 
                        "top_k": 40, 
                        "num_predict": 800
                    },
                }
                response = requests.post(f"{self.api_url}/api/generate", json=payload, timeout=60)
                response.raise_for_status()
                return response.json().get("response", "").strip()
            except Exception as e:
                logging.error(f"Ollama query failed: {e}")
                return self._fallback(user_prompt)
        else:
            return self._fallback(user_prompt)

    def _fallback(self, user_prompt):
        """Use TF-IDF similarity to return a fallback answer."""
        if not self.vectorizer or not self.tfidf_matrix.any():
            return "⚠️ No fallback data available."
        try:
            user_vec = self.vectorizer.transform([user_prompt])
            similarities = cosine_similarity(user_vec, self.tfidf_matrix)
            best_idx = similarities.argmax()
            return self.answers[best_idx]
        except Exception as e:
            logging.error(f"Fallback query failed: {e}")
            return "⚠️ Could not process your request."
