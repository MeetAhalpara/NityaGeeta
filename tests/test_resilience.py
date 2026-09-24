"""
tests/test_resilience.py
────────────────────────
Production-grade test suite for resilience, circuit breakers, and SSE streaming:
1. CircuitBreaker state transitions (CLOSED -> OPEN -> HALF_OPEN -> CLOSED).
2. CircuitBreaker fast-fail behavior and fallback execution.
3. Server-Sent Events (SSE) generator frame structure.
4. FastAPI streaming endpoint integration (/api/v1/chat/stream).
"""

import time
import json
import pytest
import asyncio
from fastapi.testclient import TestClient

from api.main import app
from api.services.circuit_breaker import (
    CircuitBreaker,
    CircuitState,
    CircuitBreakerOpenException
)
from api.services.rag_engine import stream_rag_pipeline_async


# =============================================================================
# 1. Circuit Breaker Unit Tests
# =============================================================================

@pytest.mark.asyncio
async def test_circuit_breaker_closed_to_open():
    """Circuit breaker trips to OPEN after failure_threshold consecutive errors."""
    cb = CircuitBreaker("unit_test_cb", failure_threshold=3, recovery_timeout=0.2)
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 0

    async def faulty_upstream():
        raise ConnectionResetError("Upstream connection dropped")

    # First two failures should keep state CLOSED
    for i in range(1, 3):
        with pytest.raises(ConnectionResetError):
            await cb.call(faulty_upstream)
        assert cb.state == CircuitState.CLOSED
        assert cb.failure_count == i

    # 3rd failure trips the breaker to OPEN
    with pytest.raises(ConnectionResetError):
        await cb.call(faulty_upstream)
    assert cb.state == CircuitState.OPEN
    assert cb.time_until_retry > 0.0


@pytest.mark.asyncio
async def test_circuit_breaker_fast_fail_and_fallback():
    """When OPEN, circuit breaker fast-fails without executing upstream."""
    cb = CircuitBreaker("fallback_cb", failure_threshold=1, recovery_timeout=0.5)

    executed_count = 0
    async def faulty_call():
        nonlocal executed_count
        executed_count += 1
        raise TimeoutError("Timeout")

    # Trip breaker to OPEN
    with pytest.raises(TimeoutError):
        await cb.call(faulty_call)
    assert cb.state == CircuitState.OPEN
    assert executed_count == 1

    # Fast-fail test without fallback
    with pytest.raises(CircuitBreakerOpenException) as excinfo:
        await cb.call(faulty_call)
    assert "is OPEN" in str(excinfo.value)
    # Ensure faulty_call was NOT executed during fast-fail
    assert executed_count == 1

    # Fallback test
    async def fallback_handler():
        return "cached_degraded_response"

    result = await cb.call(faulty_call, fallback=fallback_handler)
    assert result == "cached_degraded_response"
    assert executed_count == 1  # Still not called


@pytest.mark.asyncio
async def test_circuit_breaker_half_open_recovery():
    """Circuit breaker tests probe in HALF_OPEN and closes upon success."""
    cb = CircuitBreaker("recovery_cb", failure_threshold=1, recovery_timeout=0.1, half_open_success_threshold=1)

    async def faulty_call():
        raise RuntimeError("Fail")

    async def healthy_call():
        return "healthy"

    # Trip to OPEN
    with pytest.raises(RuntimeError):
        await cb.call(faulty_call)
    assert cb.state == CircuitState.OPEN

    # Wait for recovery timeout to elapse
    await asyncio.sleep(0.15)
    assert cb.state == CircuitState.HALF_OPEN

    # Probe call succeeds -> closes circuit
    res = await cb.call(healthy_call)
    assert res == "healthy"
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 0


def test_circuit_breaker_metrics():
    """Metrics dictionary contains necessary observability fields."""
    cb = CircuitBreaker("metrics_cb", failure_threshold=4, recovery_timeout=15.0)
    m = cb.get_metrics()
    assert m["name"] == "metrics_cb"
    assert m["state"] == "CLOSED"
    assert m["failure_count"] == 0
    assert m["failure_threshold"] == 4
    assert m["recovery_timeout_seconds"] == 15.0


# =============================================================================
# 2. SSE Streaming Generator Tests
# =============================================================================

@pytest.mark.asyncio
async def test_sse_streaming_frames_order(monkeypatch):
    """Verifies stream_rag_pipeline_async yields structured SSE event frames."""
    async def mock_stream_groq(messages, model=None, temperature=0.2):
        yield "You have a right to perform your prescribed duties,"
        yield " but you are not entitled to the fruits of action."

    import api.services.rag_engine as re_module
    monkeypatch.setattr(re_module, "stream_groq_completion", mock_stream_groq)

    gen = stream_rag_pipeline_async("BG 2.47")

    received_frames = []
    async for frame in gen:
        received_frames.append(frame)
        if len(received_frames) >= 15:  # Sample the beginning of the stream
            break

    assert len(received_frames) > 0, "No frames yielded from stream generator!"

    # Frame 1 MUST be the instant citations frame (<300ms metadata)
    first_frame = received_frames[0]
    assert "event: citations" in first_frame
    assert "data: " in first_frame

    # Parse citations data
    raw_json = first_frame.split("data: ")[1].strip()
    citations_data = json.loads(raw_json)
    assert "citations" in citations_data
    assert len(citations_data["citations"]) > 0

    # Top citation must be Chapter 2, Verse 47
    top_cit = citations_data["citations"][0]
    assert str(top_cit.get("chapter")) == "2"
    assert str(top_cit.get("verse")) == "47"

    # Status frame must follow
    has_status = any("event: status" in f for f in received_frames)
    assert has_status, "Missing event: status frame"

    # Token deltas must be present
    has_tokens = any("event: token" in f for f in received_frames)
    assert has_tokens, "Missing event: token frames"


# =============================================================================
# 3. FastAPI Endpoint Integration Tests
# =============================================================================

def test_api_health_endpoint():
    """GET /health returns 200 OK and healthy status."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_api_chat_stream_get_validation():
    """GET /api/v1/chat/stream validates minimum query length."""
    client = TestClient(app)
    # Empty query should return 400 Bad Request
    response = client.get("/api/v1/chat/stream?q=")
    assert response.status_code == 400


def test_api_chat_stream_post_endpoint_headers():
    """POST /api/v1/chat/stream returns text/event-stream headers."""
    client = TestClient(app)
    response = client.post(
        "/api/v1/chat/stream",
        json={"question": "BG 2.47"}
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    assert response.headers.get("cache-control") == "no-cache"
