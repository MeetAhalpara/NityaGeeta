import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

# Dataset paths
DATASET_PATH = os.getenv(
    "GITA_PRESS_JSON_PATH",
    str(BASE_DIR / "data" / "output" / "gita_editions" / "gita_press_translated.json")
)

# Groq API Keys Configuration (supporting rotation up to 8 keys)
GROQ_API_KEYS = []
for i in range(1, 9):
    key = os.getenv(f"GROQ_API_KEY{i}")
    if key and key.strip():
        GROQ_API_KEYS.append(key.strip())

# Primary Fallback if no specific keys found
if not GROQ_API_KEYS:
    primary_key = os.getenv("GROQ_API_KEY")
    if primary_key and primary_key.strip():
        GROQ_API_KEYS.append(primary_key.strip())

# Default Model Selection (Non-reasoning model for clean output)
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "llama-3.1-8b-instant")
