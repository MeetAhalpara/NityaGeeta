import time
import logging
import json
from collections import deque, defaultdict
from typing import Dict, Any, List, Optional
from database.connection import get_redis_client

logger = logging.getLogger("nityageeta.telemetry_stream")

# Fallback in-memory stream buffer if Redis is unavailable
_IN_MEMORY_STREAM = deque(maxlen=10000)
_USER_SESSION_EVENTS = defaultdict(lambda: deque(maxlen=200))

# Motif classification mapping
CHAPTER_MOTIFS = {
    1: {"name": "Arjuna's Despair", "focus": "Overcoming grief, hesitation, and emotional paralysis"},
    2: {"name": "Sankhya & Karma Yoga", "focus": "Detachment from outcomes, the immortal self, and steady wisdom"},
    3: {"name": "Karma Yoga", "focus": "Selfless action, avoiding escapism, and performing sacred duty"},
    4: {"name": "Jnana Karma Sannyasa", "focus": "Action in knowledge, burning karma in the fire of wisdom"},
    5: {"name": "Karma Sannyasa", "focus": "Renunciation of doership, peace through inner stillness"},
    6: {"name": "Dhyana Yoga", "focus": "Mastering the restless mind, meditation posture, and repeated effort"},
    7: {"name": "Jnana Vijnana", "focus": "Knowledge of the Absolute and perceiving divine order in nature"},
    8: {"name": "Akshara Brahma", "focus": "Consciousness at the moment of transition, steadfast practice"},
    9: {"name": "Raja Vidya", "focus": "The supreme secret, unconditional divine refuge, pure devotion"},
    10: {"name": "Vibhuti Yoga", "focus": "Perceiving excellence in all existence as divine manifestations"},
    11: {"name": "Vishvarupa Darshana", "focus": "Cosmic time, unavoidable fate, and awe of the universal form"},
    12: {"name": "Bhakti Yoga", "focus": "Characteristics of the compassionate seeker who harbors no ill will"},
    13: {"name": "Kshetra Kshetrajna", "focus": "Discerning the field (body-mind) from the knower of the field"},
    14: {"name": "Guna Traya Vibhaga", "focus": "Transcending the three modes: Sattva (calm), Rajas (passion), Tamas (inertia)"},
    15: {"name": "Purushottama Yoga", "focus": "The cosmic tree of life, detaching through the weapon of non-clinging"},
    16: {"name": "Daivasura Sampad", "focus": "Cultivating fearlessness and humility vs. shedding ego and arrogance"},
    17: {"name": "Shraddhatraya Vibhaga", "focus": "Purity in food, discipline, and generosity aligned with inner truth"},
    18: {"name": "Moksha Sannyasa", "focus": "Surrendering all outcomes, doing one's authentic work, and supreme liberation"}
}


def ingest_telemetry_event(
    user_id: str,
    event_type: str,
    shloka_id: Optional[str] = None,
    chapter: Optional[int] = None,
    verse: Optional[int] = None,
    dwell_ms: int = 0,
    interactions: Optional[List[str]] = None,
    scroll_velocity: float = 0.0
) -> Dict[str, Any]:
    """
    Ingests high-resolution behavioral telemetry into Redis Streams (or in-memory sliding buffer).
    """
    timestamp = time.time()
    event_payload = {
        "user_id": user_id or "anonymous",
        "event_type": event_type,
        "shloka_id": shloka_id or "",
        "chapter": str(chapter or 0),
        "verse": str(verse or 0),
        "dwell_ms": str(dwell_ms),
        "interactions": json.dumps(interactions or []),
        "scroll_velocity": str(scroll_velocity),
        "timestamp": str(timestamp)
    }

    # 1. Primary: Redis Streams
    try:
        r = get_redis_client()
        r.xadd("nityageeta:seeker_stream", event_payload, maxlen=25000)
    except Exception as e:
        logger.debug(f"Redis stream write fallback to local memory: {e}")
        _IN_MEMORY_STREAM.append(event_payload)

    # 2. Update local user session sliding window
    _USER_SESSION_EVENTS[user_id or "anonymous"].append({
        "event_type": event_type,
        "chapter": chapter,
        "verse": verse,
        "dwell_ms": dwell_ms,
        "interactions": interactions or [],
        "timestamp": timestamp
    })

    return {"status": "ingested", "user_id": user_id, "timestamp": timestamp}


def get_seeker_affinity(user_id: str) -> Dict[str, Any]:
    """
    Aggregates real-time behavioral features to deduce seeker contemplation state,
    favorite themes, and philosophical orientation.
    """
    events = list(_USER_SESSION_EVENTS.get(user_id or "anonymous", []))
    if not events:
        return {
            "dominant_chapter": 2,
            "dominant_motif": CHAPTER_MOTIFS[2]["name"],
            "focus": CHAPTER_MOTIFS[2]["focus"],
            "contemplation_level": "reflective",
            "total_dwell_seconds": 0
        }

    chapter_dwell = defaultdict(int)
    total_dwell_ms = 0

    for ev in events:
        ch = ev.get("chapter")
        dwell = ev.get("dwell_ms", 0)
        total_dwell_ms += dwell
        if ch and int(ch) > 0:
            chapter_dwell[int(ch)] += dwell

    dominant_ch = max(chapter_dwell, key=chapter_dwell.get) if chapter_dwell else 2
    motif_info = CHAPTER_MOTIFS.get(dominant_ch, CHAPTER_MOTIFS[2])

    contemplation_level = "deep" if total_dwell_ms > 60000 else "reflective"

    return {
        "dominant_chapter": dominant_ch,
        "dominant_motif": motif_info["name"],
        "focus": motif_info["focus"],
        "contemplation_level": contemplation_level,
        "total_dwell_seconds": round(total_dwell_ms / 1000, 1)
    }


def generate_steve_jobs_followup(
    question: str,
    citations: List[Dict[str, Any]],
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs the human-centric Steve Jobs Follow-Up:
    - Resonance Check: Empathetic, grounding inquiry (did the medicine land?).
    - 3 Intentional Pathways (Verbs, not generic queries):
        1. Deepen the Scripture (companion verse / philosophical root)
        2. Bring It to Real Life (workplace / relationship / daily micro-action)
        3. Read the Original Sanskrit (sacred verse / word-by-word commentary)
    """
    affinity = get_seeker_affinity(user_id or "anonymous")
    q_lower = question.lower()

    # Extract primary chapter/verse from citations if present
    primary_ch = 2
    primary_verse = 47
    if citations:
        c0 = citations[0]
        try:
            if c0.get("chapter"):
                primary_ch = int(c0.get("chapter"))
            if c0.get("verse"):
                primary_verse = int(c0.get("verse"))
        except (ValueError, TypeError):
            pass

    # Emotional Theme Detection
    if any(k in q_lower for k in ["burnout", "restless", "anxious", "stress", "tired", "exhaust"]):
        resonance_check = "Did this perspective on letting go of outcomes give you room to breathe?"
        pathway_deep = {
            "id": "deepen_scripture",
            "icon": "🌿",
            "label": "Go Deeper into the Scripture",
            "prompt": "Explore why Krishna compares the restless mind to the wind in Chapter 6 (Shloka 6.34)",
            "description": "Understand the nature of mental storms and repeated practice (Abhyasa)."
        }
        pathway_action = {
            "id": "real_life_action",
            "icon": "⚡",
            "label": "Bring It to Real Life",
            "prompt": "How do I practically apply detached focus during tomorrow's workday when deadlines spike?",
            "description": "Concrete micro-habits for high-pressure execution without exhaustion."
        }
        pathway_sanskrit = {
            "id": "original_sanskrit",
            "icon": "📖",
            "label": "Read the Original Sanskrit",
            "prompt": f"Show me Chapter {primary_ch} Verse {primary_verse} with transliteration and word-by-word Sanskrit meaning",
            "description": "Connect directly with the classical sacred verse and ancient commentary."
        }
    elif any(k in q_lower for k in ["grief", "death", "lost", "sad", "crying", "mourn"]):
        resonance_check = "Did this reminder of the unshakeable soul bring a moment of stillness?"
        pathway_deep = {
            "id": "deepen_scripture",
            "icon": "🌿",
            "label": "Go Deeper into the Scripture",
            "prompt": "How does Krishna explain that the soul was never born and never dies in Chapter 2, Verse 20?",
            "description": "Examine the non-dual truth of eternal consciousness beyond physical form."
        }
        pathway_action = {
            "id": "real_life_action",
            "icon": "⚡",
            "label": "Bring It to Real Life",
            "prompt": "How can I support myself or a loved one moving through profound loss using this wisdom?",
            "description": "Practical ways to honor grief without becoming swallowed by despair."
        }
        pathway_sanskrit = {
            "id": "original_sanskrit",
            "icon": "📖",
            "label": "Read the Original Sanskrit",
            "prompt": f"Show me Chapter 2 Verse 22 with the metaphor of casting off worn-out garments",
            "description": "Reflect on Krishna's poetic imagery of spiritual continuity."
        }
    elif any(k in q_lower for k in ["duty", "decision", "confused", "career", "choice", "dilemma"]):
        resonance_check = "Did this clarify the boundary between your duty and personal attachment?"
        pathway_deep = {
            "id": "deepen_scripture",
            "icon": "🌿",
            "label": "Go Deeper into the Scripture",
            "prompt": "What is Svadharma (authentic nature) according to Chapter 3 Verse 35?",
            "description": "Understand why performing your own authentic path is superior to another's."
        }
        pathway_action = {
            "id": "real_life_action",
            "icon": "⚡",
            "label": "Bring It to Real Life",
            "prompt": "How do I make difficult career choices without being paralyzed by fear of regret?",
            "description": "A 3-step Dharmic framework for decisive action."
        }
        pathway_sanskrit = {
            "id": "original_sanskrit",
            "icon": "📖",
            "label": "Read the Original Sanskrit",
            "prompt": f"Show me Chapter {primary_ch} Verse {primary_verse} with Adi Shankaracharya's commentary",
            "description": "Read the classical commentary on discerning righteous action."
        }
    else:
        # Grounded default inspired by seeker affinity
        affinity_ch = affinity.get("dominant_chapter", 2)
        resonance_check = "Did this teaching illuminate the heart of what you were seeking?"
        pathway_deep = {
            "id": "deepen_scripture",
            "icon": "🌿",
            "label": "Go Deeper into the Scripture",
            "prompt": f"How does Chapter {affinity_ch} expand upon this philosophical foundation?",
            "description": f"Explore Krishna's deeper teachings on {affinity.get('dominant_motif', 'Wisdom')}."
        }
        pathway_action = {
            "id": "real_life_action",
            "icon": "⚡",
            "label": "Bring It to Real Life",
            "prompt": "What is one simple discipline I can integrate into my morning routine from this verse?",
            "description": "Bridge sacred contemplation into lived daily practice."
        }
        pathway_sanskrit = {
            "id": "original_sanskrit",
            "icon": "📖",
            "label": "Read the Original Sanskrit",
            "prompt": f"Show me Chapter {primary_ch} Verse {primary_verse} in original Sanskrit with English translation",
            "description": "Recite the original meter and meditate on the root Sanskrit words."
        }

    return {
        "resonance_check": resonance_check,
        "pathways": [pathway_deep, pathway_action, pathway_sanskrit]
    }
