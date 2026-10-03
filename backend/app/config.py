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

# Vakh Configuration & Integration Layer
VAKH_BASE_URL = os.getenv("VAKH_BASE_URL", "https://vakh.com")
VAKH_API_KEY = os.getenv("VAKH_API_KEY", "vakh_api_squawk_aog_recovery_2026")
VAKH_WEBHOOK_SECRET = os.getenv("VAKH_WEBHOOK_SECRET", "vakh_whsec_squawk_prod_99")
VAKH_FORM_KEY = os.getenv("VAKH_FORM_KEY", "aog_defect_intake")
VAKH_WORKSPACE_KEY = os.getenv("VAKH_WORKSPACE_KEY", "aog_recovery_workspace")
