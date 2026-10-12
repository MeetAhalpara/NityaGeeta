"""
api/services/observability.py
───────────────────────────────
Centralized Langfuse LLM Observability & Tracing Singleton.
Safely initializes Langfuse with defensive fallback (runs in no-op if keys are missing).
"""

import os
import logging
from typing import Optional, Any
from dotenv import load_dotenv

load_dotenv()

from langfuse import Langfuse, observe

logger = logging.getLogger("nityageeta.observability")

_langfuse_client: Optional[Langfuse] = None

def get_langfuse() -> Optional[Langfuse]:
    """Returns singleton Langfuse client or None if unconfigured."""
    global _langfuse_client
    if _langfuse_client is None:
        public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
        secret_key = os.getenv("LANGFUSE_SECRET_KEY")
        host = os.getenv("LANGFUSE_HOST") or os.getenv("LANGFUSE_BASE_URL", "https://us.cloud.langfuse.com")
        
        if public_key and secret_key:
            try:
                _langfuse_client = Langfuse(
                    public_key=public_key,
                    secret_key=secret_key,
                    host=host
                )
                logger.info("Langfuse LLM Observability initialized successfully.")
            except Exception:
                logger.exception("Failed to initialize Langfuse client")
                _langfuse_client = None
        else:
            logger.info("Langfuse credentials not configured in environment. Running in no-op mode.")
    return _langfuse_client

def record_judge_score(trace_id: str, name: str, value: float, comment: Optional[str] = None):
    """Logs LLM-as-a-Judge score directly to the Langfuse trace."""
    client = get_langfuse()
    if client:
        try:
            client.create_score(
                trace_id=trace_id,
                name=name,
                value=value,
                comment=comment
            )
        except Exception as e:
            logger.debug("Failed to record Langfuse score: %s", e)
