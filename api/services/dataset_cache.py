import json
import logging
from typing import List, Dict, Any, Optional
from api.config import DATASET_PATH

logger = logging.getLogger("nityageeta.dataset_cache")
logging.basicConfig(level=logging.INFO)

# Global memory caches
_dataset: List[Dict[str, Any]] = []
_page_index: Dict[int, Dict[str, Any]] = {}

def load_dataset() -> None:
    """Loads the consolidated Gita Press dataset into memory."""
    global _dataset, _page_index
    try:
        logger.info(f"Loading dataset from: {DATASET_PATH}")
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        if isinstance(data, list):
            _dataset = data
            _page_index = {item["page"]: item for item in data if isinstance(item, dict) and "page" in item}
            logger.info(f"Successfully loaded {len(_page_index)} pages from dataset.")
        else:
            logger.error("Dataset format is invalid: expected list of pages.")
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")

def get_page(page_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a page object by page number (constant time O(1))."""
    return _page_index.get(page_id)

def search_dataset(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Performs a fast keyword search across pages in memory."""
    if not query or not query.strip():
        return []
    
    terms = query.lower().split()
    results = []
    
    for item in _dataset:
        page_num = item.get("page", 0)
        original_text = item.get("original", "").lower()
        english_text = item.get("english", "").lower()
        
        # Simple score based on match occurrences of terms
        score = 0
        for term in terms:
            score += original_text.count(term) * 2.0  # More weight to Sanskrit matching
            score += english_text.count(term) * 1.0
            
        if score > 0:
            results.append({
                "page": page_num,
                "original": item.get("original", ""),
                "english": item.get("english", ""),
                "score": round(score, 2)
            })
            
    # Sort by highest match score
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]

# Auto-load on import
load_dataset()
