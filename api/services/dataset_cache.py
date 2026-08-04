import json
import logging
import re
from typing import List, Dict, Any, Optional

from api.config import (
    GITA_PRESS_PATH,
    WINTHROP_SARGEANT_PATH,
    SADHAK_SANJEEVANI_ENG_PATH,
    SHANKARACHARYA_PATH,
    BOSS_OCR_PATH
)
from api.services.verse_index import build_verse_index, search_verses, get_verse_index_size

logger = logging.getLogger("nityageeta.dataset_cache")
logging.basicConfig(level=logging.INFO)

# Global memory caches for scripture resources
_datasets: Dict[str, List[Dict[str, Any]]] = {
    "p1_gita_press": [],
    "p2_winthrop_sargeant": [],
    "p3_sadhak_sanjeevani_eng": [],
    "p4_shankaracharya": [],
    "alt_boss_ocr": []
}

DATASET_CONFIGS = [
    {
        "id": "p1_gita_press",
        "name": "Srimad Bhagavad Gita Press Gorakhpur",
        "priority": 1,
        "weight_multiplier": 3.0,
        "path": GITA_PRESS_PATH
    },
    {
        "id": "p2_winthrop_sargeant",
        "name": "Winthrop Sargeant (Word-for-Word English)",
        "priority": 2,
        "weight_multiplier": 2.5,
        "path": WINTHROP_SARGEANT_PATH
    },
    {
        "id": "p3_sadhak_sanjeevani_eng",
        "name": "Gita Sadhak Sanjeevani English",
        "priority": 3,
        "weight_multiplier": 2.0,
        "path": SADHAK_SANJEEVANI_ENG_PATH
    },
    {
        "id": "p4_shankaracharya",
        "name": "Commentary of Adi Shankaracharya",
        "priority": 4,
        "weight_multiplier": 1.5,
        "path": SHANKARACHARYA_PATH
    },
    {
        "id": "alt_boss_ocr",
        "name": "Basics of Sanatan Sanskriti (Veducation)",
        "priority": 5,
        "weight_multiplier": 1.0,
        "path": BOSS_OCR_PATH
    }
]

def load_all_datasets() -> None:
    """Loads all 4 priority Gita datasets and the alternative Boss OCR dataset into memory."""
    global _datasets
    for cfg in DATASET_CONFIGS:
        ds_id = cfg["id"]
        path = cfg["path"]
        try:
            logger.info(f"Loading Priority {cfg['priority']} dataset [{cfg['name']}] from: {path}")
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    _datasets[ds_id] = data
                    logger.info(f"Successfully loaded {len(data)} pages for [{cfg['name']}].")
                else:
                    logger.warning(f"Unexpected JSON format in {path}. Expected list.")
        except Exception as e:
            logger.error(f"Failed to load dataset [{cfg['name']}]: {e}")

STOP_WORDS = {
    "what", "should", "i", "do", "have", "in", "building", "is", "the", "a", "an", "of",
    "to", "and", "or", "for", "with", "on", "at", "by", "from", "my", "your", "it", "this",
    "that", "how", "can", "be", "issues", "issues", "help", "please", "want", "like", "get", "some"
}

def _score_item(item: Dict[str, Any], keywords: List[str], weight_multiplier: float) -> float:
    """Calculates search match score for an item based on term frequency and priority weight."""
    original = str(item.get("original", "")).lower()
    english = str(item.get("english", "")).lower()
    text = str(item.get("text", "")).lower()
    full_content = f"{original} {english} {text}"

    # Filter out non-scripture author bios, copyright notices, and publisher back-matter
    ignored_keywords = ["about the author", "prateeik prajapati", "all rights reserved", "isbn", "engineer"]
    if any(kw in full_content for kw in ignored_keywords):
        return 0.0
    
    score = 0.0
    matched_count = 0
    for term in keywords:
        if not term or len(term) < 3 or term in STOP_WORDS:
            continue
        c_orig = original.count(term)
        c_eng = english.count(term)
        c_txt = text.count(term)
        term_matches = c_orig + c_eng + c_txt
        if term_matches > 0:
            matched_count += 1
            score += c_orig * 3.0 + c_eng * 1.5 + c_txt * 1.0
        
    if matched_count == 0:
        return 0.0
        
    return score * weight_multiplier


def search_all_datasets(query: str, top_per_dataset: int = 1) -> List[Dict[str, Any]]:
    """Performs prioritized search across all 4 Gita datasets + alternative resource.
    Returns results ordered by dataset priority hierarchy and relevance score."""
    if not query or not query.strip():
        return []
        
    raw_terms = re.findall(r'\w+', query.lower())
    keywords = [t for t in raw_terms if t not in STOP_WORDS and len(t) >= 3]
    if not keywords:
        keywords = raw_terms
        
    all_results = []
    
    for cfg in DATASET_CONFIGS:
        ds_id = cfg["id"]
        items = _datasets.get(ds_id, [])
        dataset_matches = []
        
        for item in items:
            raw_score = _score_item(item, keywords, cfg["weight_multiplier"])
            # Threshold requirement to prevent random irrelevant page matches
            if raw_score >= 3.0:
                dataset_matches.append({
                    "priority": cfg["priority"],
                    "source": cfg["name"],
                    "source_id": ds_id,
                    "page": item.get("page", 0),
                    "original": item.get("original", ""),
                    "english": item.get("english", ""),
                    "text": item.get("text", ""),
                    "score": round(raw_score, 2)
                })
                
        # Sort current dataset matches by score
        dataset_matches.sort(key=lambda x: x["score"], reverse=True)
        # Take top items for this dataset
        if dataset_matches:
            all_results.extend(dataset_matches[:top_per_dataset])
        
    # Sort combined results primarily by priority rank, secondarily by score
    all_results.sort(key=lambda x: (x["priority"], -x["score"]))
    return all_results


def get_page(page_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a page object by page number from Priority 1 dataset."""
    items = _datasets.get("p1_gita_press", [])
    for item in items:
        if item.get("page") == page_id:
            return item
    return None

def search_dataset(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Legacy helper wrapper for search_all_datasets."""
    return search_all_datasets(query, top_per_dataset=1)[:limit]

# Auto-load on module import
load_all_datasets()

# Build verse index after datasets are loaded
build_verse_index(_datasets)
logger.info(f"Verse index ready with {get_verse_index_size()} shlokas.")

# Re-export search_verses so callers only need to import from dataset_cache
def unwrap_ocr_paragraphs(text: str) -> str:
    """Unwraps artificial single OCR line breaks into continuous paragraph lines."""
    if not text:
        return ""
    s = text.replace("\r\n", "\n")
    s = re.sub(r'\n\s*\n+', ' __PARA__ ', s)
    s = s.replace('\n', ' ')
    s = re.sub(r'\s*__PARA__\s*', '\n\n', s)
    s = re.sub(r' {2,}', ' ', s)
    return s.strip()


def search_boss_context(query: str, top_k: int = 3, max_chars_per_page: int = 600) -> str:
    """
    Search the BOSS (Basics of Sanatan Sanskriti) book for the most relevant pages
    and return them formatted as a context block for the BOSS Brain (M6).
    """
    boss_pages = _datasets.get("alt_boss_ocr", [])
    if not boss_pages:
        return ""

    raw_terms = re.findall(r'\w+', query.lower())
    keywords = [t for t in raw_terms if t not in STOP_WORDS and len(t) >= 3]
    if not keywords:
        return ""

    scored = []
    for item in boss_pages:
        text = str(item.get("text", "")).lower()
        # Filter copyright/author pages
        if any(kw in text for kw in ["prateeik prajapati", "isbn", "all rights reserved"]):
            continue
        score = sum(text.count(kw) for kw in keywords)
        if score > 0:
            scored.append((score, item))

    scored.sort(key=lambda x: -x[0])
    top_pages = [item for _, item in scored[:top_k]]

    if not top_pages:
        return ""

    parts = []
    for item in top_pages:
        page_num = item.get("page", 0)
        raw_t = unwrap_ocr_paragraphs(str(item.get("text", "")))
        text = raw_t[:max_chars_per_page]
        parts.append(f"[BOSS Page {page_num}]\n{text}")

    return "\n\n".join(parts)


def search_boss_items(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Search the BOSS book and return raw matched item dicts with page and text."""
    boss_pages = _datasets.get("alt_boss_ocr", [])
    if not boss_pages:
        return []

    raw_terms = re.findall(r'\w+', query.lower())
    keywords = [t for t in raw_terms if t not in STOP_WORDS and len(t) >= 3]
    if not keywords:
        return []

    scored = []
    for item in boss_pages:
        text = str(item.get("text", "")).lower()
        if any(kw in text for kw in ["prateeik prajapati", "isbn", "all rights reserved"]):
            continue
        score = sum(text.count(kw) for kw in keywords)
        if score > 0:
            unwrapped_item = dict(item)
            unwrapped_item["text"] = unwrap_ocr_paragraphs(str(item.get("text", "")))
            scored.append((score, unwrapped_item))

    scored.sort(key=lambda x: -x[0])
    return [item for _, item in scored[:top_k]]


__all__ = ["search_all_datasets", "search_verses", "search_boss_context", "search_boss_items", "get_page", "search_dataset"]

