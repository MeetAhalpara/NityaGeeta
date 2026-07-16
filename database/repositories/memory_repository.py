"""
database/repositories/memory_repository.py

Manages the AI memory system for NityaGeeta using Redis.

Memory strategy:
  - Redis stores the last 20 messages per conversation as a hot cache.
  - AI receives these 20 messages instantly on every request (no DB query).
  - For older messages, the AI queries Weaviate (semantic search).
  - Nothing is ever summarized or compressed — full fidelity is preserved.

Redis Key Structure:
  conv:{conversation_id}:messages  -> Redis List of JSON message objects
  user:{user_id}:session           -> Redis Hash of session data
"""

import json
from datetime import datetime, timezone
from database.connection import get_redis_client


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MAX_HOT_MESSAGES       = 20          # Number of messages to keep in Redis per conversation
SESSION_TTL_SECONDS    = 18 * 24 * 60 * 60  # 18 days in seconds
CONVERSATION_TTL_HOURS = 24          # How long to keep an idle conversation in Redis (hours)


def _conversation_key(conversation_id: str) -> str:
    return f"conv:{conversation_id}:messages"

def _session_key(user_id: str) -> str:
    return f"user:{user_id}:session"


# ---------------------------------------------------------------------------
# Hot Message Cache (Redis List)
# ---------------------------------------------------------------------------

def push_message_to_cache(conversation_id: str, role: str,
                           content: str, message_id: str) -> None:
    """
    Push a new message to the Redis conversation cache.
    Trims the list to the last MAX_HOT_MESSAGES messages to prevent unbounded growth.
    """
    redis = get_redis_client()
    key = _conversation_key(conversation_id)

    message_json = json.dumps({
        "id":         message_id,
        "role":       role,
        "content":    content,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # RPUSH appends to the right (newest end of the list)
    redis.rpush(key, message_json)

    # Trim to keep only the last MAX_HOT_MESSAGES (oldest are at index 0)
    redis.ltrim(key, -MAX_HOT_MESSAGES, -1)

    # Refresh the TTL on every message so active conversations stay warm
    redis.expire(key, CONVERSATION_TTL_HOURS * 3600)


def get_hot_messages(conversation_id: str) -> list[dict]:
    """
    Retrieve the last MAX_HOT_MESSAGES from the Redis cache.
    Returns a list of message dicts in chronological order (oldest first).
    Returns an empty list if the conversation is not in cache (cache miss).
    """
    redis = get_redis_client()
    key = _conversation_key(conversation_id)

    raw_messages = redis.lrange(key, 0, -1)
    return [json.loads(msg) for msg in raw_messages]


def is_conversation_cached(conversation_id: str) -> bool:
    """Check whether a conversation has a warm cache in Redis."""
    redis = get_redis_client()
    return redis.exists(_conversation_key(conversation_id)) > 0


def warm_up_cache(conversation_id: str, messages: list[dict]) -> None:
    """
    Pre-populate the Redis cache from PostgreSQL messages.
    Called on a cache miss (user opens an older conversation).
    Only stores the last MAX_HOT_MESSAGES to stay within the hot window.
    """
    redis = get_redis_client()
    key = _conversation_key(conversation_id)

    # Take only the most recent messages
    recent = messages[-MAX_HOT_MESSAGES:] if len(messages) > MAX_HOT_MESSAGES else messages

    # Clear any stale data and repopulate
    redis.delete(key)
    for msg in recent:
        message_json = json.dumps({
            "id":         str(msg.get("id", "")),
            "role":       msg["role"],
            "content":    msg["content"],
            "created_at": str(msg.get("created_at", ""))
        })
        redis.rpush(key, message_json)

    redis.expire(key, CONVERSATION_TTL_HOURS * 3600)


def clear_conversation_cache(conversation_id: str) -> None:
    """Remove a conversation from Redis cache (e.g., after deletion)."""
    redis = get_redis_client()
    redis.delete(_conversation_key(conversation_id))


# ---------------------------------------------------------------------------
# Session Cache (Redis Hash)
# ---------------------------------------------------------------------------

def cache_user_session(user_id: str, session_data: dict) -> None:
    """
    Store user session metadata in Redis for fast auth validation.
    Used so the auth middleware doesn't need to hit PostgreSQL on every request.
    """
    redis = get_redis_client()
    key = _session_key(user_id)

    # Store flat key-value pairs (Redis Hash)
    flat_data = {k: str(v) for k, v in session_data.items()}
    redis.hset(key, mapping=flat_data)
    redis.expire(key, SESSION_TTL_SECONDS)


def get_cached_session(user_id: str) -> dict | None:
    """
    Retrieve cached session data for a user.
    Returns None if the session cache has expired or doesn't exist.
    """
    redis = get_redis_client()
    key = _session_key(user_id)
    data = redis.hgetall(key)
    return data if data else None


def invalidate_user_session_cache(user_id: str) -> None:
    """Remove a user's session from Redis (logout)."""
    redis = get_redis_client()
    redis.delete(_session_key(user_id))


# ---------------------------------------------------------------------------
# Context Builder for AI
# ---------------------------------------------------------------------------

def build_ai_context(conversation_id: str,
                     fallback_messages: list[dict] = None) -> list[dict]:
    """
    Build the message context list that will be sent to the AI model.

    Retrieves hot messages from Redis.
    If the cache is cold (miss), uses fallback_messages from PostgreSQL.

    Returns a list of dicts with 'role' and 'content' keys,
    formatted for the OpenRouter API.
    """
    if is_conversation_cached(conversation_id):
        messages = get_hot_messages(conversation_id)
    elif fallback_messages:
        # Warm up the cache from PostgreSQL data
        warm_up_cache(conversation_id, fallback_messages)
        messages = get_hot_messages(conversation_id)
    else:
        messages = []

    # Format for OpenRouter API: only role and content fields
    return [
        {"role": msg["role"], "content": msg["content"]}
        for msg in messages
    ]
