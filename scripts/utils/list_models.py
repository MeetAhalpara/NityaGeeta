import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY is not set.")
else:
    print("GEMINI_API_KEY is configured.")

client = genai.Client(api_key=api_key)

try:
    print("\nListing available models:")
    for model in client.models.list():
        print(f" - {model.name} (Supported: {model.supported_actions})")
except Exception as e:
    print(f"\nError listing models: {e}")
