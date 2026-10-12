"""
scripts/test_langfuse_trace.py
───────────────────────────────
Verifies Langfuse cloud connectivity and emits a verification trace.
"""

import os
import sys
from dotenv import load_dotenv

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from api.services.observability import get_langfuse, observe

client = get_langfuse()
if not client:
    print("[FAIL] Langfuse credentials not found. Please set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY in .env")
    sys.exit(1)

try:
    if not client.auth_check():
        print("[FAIL] Langfuse authentication failed. Check your API keys and host.")
        sys.exit(1)

    @observe(name="test-connectivity", as_type="generation")
    def run_test_generation():
        return "Pong response from NityaGeeta test suite"

    output = run_test_generation()
    client.flush()

    host = os.getenv("LANGFUSE_HOST") or os.getenv("LANGFUSE_BASE_URL", "https://us.cloud.langfuse.com")
    print("[OK] Langfuse connected successfully.")
    print(f"[OK] Verification generation trace sent to Langfuse: '{output}'")
    print(f"[OK] View your live traces on the Langfuse dashboard: {host.rstrip('/')}")
except Exception as e:
    print(f"[ERROR] Failed to send test trace: {e}")
    sys.exit(1)
