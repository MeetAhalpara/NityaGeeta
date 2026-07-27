import logging
from typing import List, Dict, Any
from groq import Groq
from api.config import GROQ_API_KEYS, DEFAULT_MODEL, FALLBACK_MODEL

logger = logging.getLogger("nityageeta.llm_client")
logging.basicConfig(level=logging.INFO)

# Global tracker for API key index
_key_index = 0

def get_next_client() -> tuple[Groq, str]:
    """Rotates API keys and returns a new Groq client instance and key indicator."""
    global _key_index
    if not GROQ_API_KEYS:
        raise ValueError("No Groq API keys configured in .env file.")
        
    current_key = GROQ_API_KEYS[_key_index % len(GROQ_API_KEYS)]
    client_indicator = f"Key #{(_key_index % len(GROQ_API_KEYS)) + 1}"
    _key_index += 1
    
    return Groq(api_key=current_key), client_indicator

def generate_chat_response(messages: List[Dict[str, str]], temperature: float = 0.3) -> str:
    """Generates an AI response from Groq with key rotation and automatic retry logic on rate limits."""
    attempts = len(GROQ_API_KEYS)
    if attempts == 0:
        logger.error("No Groq API keys available.")
        return "System configuration error: API keys not available."

    for attempt in range(attempts):
        try:
            client, indicator = get_next_client()
            logger.info(f"Dispatching query using Groq {indicator} (Model: {DEFAULT_MODEL})...")
            
            completion = client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=1000
            )
            
            # Extract content from response
            output = completion.choices[0].message.content
            if output:
                return output.strip()
            return "No content returned from AI model."
            
        except Exception as e:
            err_msg = str(e).lower()
            if "rate limit" in err_msg or "429" in err_msg:
                logger.warning(f"Groq API {indicator} rate limited (HTTP 429). Rotating key and retrying... (Attempt {attempt + 1}/{attempts})")
                continue
            else:
                logger.error(f"Groq API error on {indicator}: {e}")
                # Fallback to secondary model on same key if it was a context size/model error
                try:
                    logger.info(f"Attempting fallback model: {FALLBACK_MODEL}...")
                    client, _ = get_next_client()
                    completion = client.chat.completions.create(
                        model=FALLBACK_MODEL,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=800
                    )
                    output = completion.choices[0].message.content
                    if output:
                        return output.strip()
                except Exception as fallback_err:
                    logger.error(f"Fallback model error: {fallback_err}")
                break
                
    return "All configured API keys encountered rate limits or connection errors. Please retry in a few moments."
