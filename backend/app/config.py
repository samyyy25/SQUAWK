import os
from dotenv import load_dotenv

load_dotenv()

ROCKETRIDE_URI = os.getenv("ROCKETRIDE_URI", "https://api.rocketride.ai/v1")
ROCKETRIDE_APIKEY = os.getenv("ROCKETRIDE_APIKEY", "demo_rocketride_key_squawk_2026")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./squawk.db")
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
PORT = int(os.getenv("PORT", "8000"))
