import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

# Priority 1: Gita Press Gorakhpur (Original translated)
GITA_PRESS_PATH = os.getenv(
    "GITA_PRESS_JSON_PATH",
    str(BASE_DIR / "data" / "output" / "gita_editions" / "gita_press_translated.json")
)

# Priority 2: Winthrop Sargeant (Word-for-Word English)
WINTHROP_SARGEANT_PATH = os.getenv(
    "WINTHROP_SARGEANT_PATH",
    str(BASE_DIR / "data" / "output" / "gita_editions" / "The Bhagavad Gita Winthrop Sargeant (Word-for-Word English).json")
)

# Priority 3: Gita Sadhak Sanjeevani English
SADHAK_SANJEEVANI_ENG_PATH = os.getenv(
    "SADHAK_SANJEEVANI_ENG_PATH",
    str(BASE_DIR / "data" / "output" / "gita_editions" / "Gita-Sadhak-Sanjevani-English.json")
)

# Priority 4: Bhagavad Gita with Adi Shankaracharya Commentary
SHANKARACHARYA_PATH = os.getenv(
    "SHANKARACHARYA_PATH",
    str(BASE_DIR / "data" / "output" / "gita_editions" / "Bhagavad Gita with the Commentary of Adi Shankaracharya.json")
)

# Alternative / Fallback Resource: Veducation Basics of Sanatan Sanskriti
BOSS_OCR_PATH = os.getenv(
    "BOSS_OCR_PATH",
    str(BASE_DIR / "data" / "output" / "veducation_books" / "boss_ocr.json")
)

# Legacy alias
DATASET_PATH = GITA_PRESS_PATH

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

# OpenRouter API Key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()

# Model Selection Config
DEFAULT_MODEL  = os.getenv("DEFAULT_MODEL",  "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "llama-3.1-8b-instant")

# ── OpenRouter model IDs for each Brain ──────────────────────────────────────
# Each Brain uses a genuinely different model from a different provider/family.
# Confirmed working via connectivity test 2026-08-03.
OPENROUTER_BRAIN2_MODEL = "deepseek/deepseek-chat-v3-0324"         # DeepSeek V3   — reasoning-strong
OPENROUTER_BRAIN3_MODEL = "mistralai/mistral-small-3.1-24b-instruct" # Mistral 24B  — European model
OPENROUTER_BRAIN4_MODEL = "google/gemma-3-12b-it"                   # Gemma 3 12B  — Google model
OPENROUTER_BRAIN5_MODEL = "openai/gpt-4o-mini"                      # GPT-4o mini  — OpenAI model

