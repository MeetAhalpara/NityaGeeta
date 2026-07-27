import logging
from typing import Dict, Any, Optional
from api.services.dataset_cache import search_dataset, get_page
from api.services.llm_client import generate_chat_response

logger = logging.getLogger("nityageeta.rag_engine")
logging.basicConfig(level=logging.INFO)

# Structured system instruction enforcing scriptural alignment
SYSTEM_PROMPT = """You are NityaGeeta, a precise spiritual companion grounded in the teachings of the Bhagavad Gita.
Your task is to answer the user's question using ONLY the provided Gita Press Sadhaka-Sanjivani commentary context.

CRITICAL INSTRUCTIONS:
1. Do not speculate or hallucinate. Keep the answer strictly grounded in the provided scripture context.
2. Maintain a respectful, devotional, yet practical tone.
3. If the context does not contain relevant information to answer the question, state: "The provided Gita Press Sadhaka-Sanjivani commentary does not contain direct information to answer this question."
4. Do not include thinking tags like <think> or </think> in your output.
"""

def execute_rag_query(question: str) -> Dict[str, Any]:
    """Retrieves context, designs prompt, executes key-rotated LLM query, and returns response with citation."""
    logger.info(f"Initiating RAG pipeline for query: {question}")
    
    # 1. Search memory-cached dataset for top matching commentary pages
    search_results = search_dataset(question, limit=3)
    
    if not search_results:
        # Fallback to general Gita query if no direct match found
        logger.info("No direct keyword match found in dataset cache. Running baseline prompt.")
        context_text = "No direct commentary page matched the search keywords."
        citation = {
            "page": 1,
            "source": "Gita Press Gorakhpur (Sadhaka-Sanjivani)",
            "verse": "General Guidance"
        }
    else:
        # Use the top matching page as primary context
        top_match = search_results[0]
        page_num = top_match["page"]
        original_sanskrit = top_match.get("original", "")
        english_translation = top_match.get("english", "")
        
        context_text = f"Page {page_num} Original:\n{original_sanskrit}\n\nPage {page_num} English Translation/Commentary:\n{english_translation}"
        
        # Deduce Chapter/Verse numbers if present in original text
        verse_ref = "Commentary Segment"
        for line in original_sanskrit.splitlines()[:5]:
            if "श्लोक" in line or "Verse" in line:
                verse_ref = line.strip()
                break
                
        citation = {
            "page": page_num,
            "source": "Gita Press Gorakhpur (Sadhaka-Sanjivani)",
            "verse": verse_ref,
            "sanskrit": original_sanskrit[:200] + "...",
            "translation": english_translation[:200] + "..."
        }
        logger.info(f"Top RAG match found: Page {page_num} (Score: {top_match['score']})")

    # 2. Build model prompt messages
    user_prompt = f"Grounded Scripture Context:\n{context_text}\n\nUser Question:\n{question}"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]
    
    # 3. Generate response using rotated keys
    answer = generate_chat_response(messages)
    
    return {
        "answer": answer,
        "citation": citation
    }
