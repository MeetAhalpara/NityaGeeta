import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:10]}...{api_key[-5:] if api_key else ''}")

client = genai.Client(api_key=api_key)

try:
    print("\nListing available models:")
    for model in client.models.list():
        print(f" - {model.name} (Supported: {model.supported_actions})")
except Exception as e:
    print(f"\nError listing models: {e}")
