"""
circuit_breaker.py
──────────────────
Production-grade Async Circuit Breaker pattern for upstream LLM and external API calls.

Protects the event loop from thread/worker starvation when upstream providers
(Groq, OpenRouter, Weaviate) encounter rate limits (HTTP 429), outages (HTTP 503),
or network timeouts.

States:
  - CLOSED: Requests pass through normally. Tracks consecutive failures.
  - OPEN: Requests fail fast or route directly to fallbacks without network I/O.
  - HALF_OPEN: Allows probe requests to test upstream recovery after timeout.
"""

import time
import asyncio
import logging
from enum import Enum
from typing import Callable, Any, Optional, Dict, List

logger = logging.getLogger("nityageeta.circuit_breaker")


class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreakerOpenException(Exception):
    """Raised when an operation is attempted while the circuit breaker is in OPEN state."""
    def __init__(self, name: str, retry_after: float):
        self.name = name
        self.retry_after = retry_after
        super().__init__(
            f"Circuit breaker '{name}' is OPEN. Upstream unavailable. Retry after {round(retry_after, 1)}s."
        )


class CircuitBreaker:
    """
    Asynchronous Circuit Breaker state machine.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        half_open_success_threshold: int = 2
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_success_threshold = half_open_success_threshold

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._half_open_in_flight = False
        self._last_state_change = time.time()
        self._lock = asyncio.Lock()

    @property
    def state(self) -> CircuitState:
        """Read-only inspection of circuit breaker state."""
        if self._state == CircuitState.OPEN:
            elapsed = time.time() - self._last_state_change
            if elapsed >= self.recovery_timeout:
                return CircuitState.HALF_OPEN
        return self._state

    @property
    def failure_count(self) -> int:
        return self._failure_count

    @property
    def time_until_retry(self) -> float:
        if self._state == CircuitState.OPEN:
            elapsed = time.time() - self._last_state_change
            return max(0.0, self.recovery_timeout - elapsed)
        return 0.0

    async def _handle_open(
        self,
        fallback: Optional[Callable[..., Any]],
        remaining: float,
        *args: Any,
        **kwargs: Any
    ) -> Any:
        logger.warning(
            f"Circuit breaker '{self.name}' is OPEN ({round(remaining, 1)}s remaining). Fast-failing."
        )
        if fallback:
            if asyncio.iscoroutinefunction(fallback):
                return await fallback(*args, **kwargs)
            return fallback(*args, **kwargs)
        raise CircuitBreakerOpenException(self.name, remaining)

    async def call(
        self,
        func: Callable[..., Any],
        *args: Any,
        fallback: Optional[Callable[..., Any]] = None,
        **kwargs: Any
    ) -> Any:
        """
        Executes func(*args, **kwargs) guarded by the circuit breaker.
        Safely acquires lock to test and transition state before executing.
        """
        async with self._lock:
            now = time.time()
            if self._state == CircuitState.OPEN:
                elapsed = now - self._last_state_change
                if elapsed >= self.recovery_timeout:
                    # Transition to HALF_OPEN for a single probe request
                    self._state = CircuitState.HALF_OPEN
                    self._success_count = 0
                    self._half_open_in_flight = True
                    self._last_state_change = now
                    logger.info(f"Circuit breaker '{self.name}' entered HALF_OPEN (single probe reserved)")
                else:
                    remaining = max(0.0, self.recovery_timeout - elapsed)
                    return await self._handle_open(fallback, remaining, *args, **kwargs)
            elif self._state == CircuitState.HALF_OPEN:
                if self._half_open_in_flight:
                    # Probe already running, fast-fail or fallback other concurrent requests
                    logger.warning(f"Circuit breaker '{self.name}' probe in-flight. Fast-failing concurrent call.")
                    return await self._handle_open(fallback, 1.0, *args, **kwargs)
                self._half_open_in_flight = True

        try:
            # Execute the coroutine or sync function
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                loop = asyncio.get_running_loop()
                result = await loop.run_in_executor(None, lambda: func(*args, **kwargs))

            await self._record_success()
            return result

        except Exception as exc:
            await self._record_failure(exc)
            if fallback:
                logger.info(f"Circuit breaker '{self.name}' invoking fallback due to: {exc}")
                if asyncio.iscoroutinefunction(fallback):
                    return await fallback(*args, **kwargs)
                return fallback(*args, **kwargs)
            raise

    async def _record_success(self) -> None:
        async with self._lock:
            self._half_open_in_flight = False
            if self._state == CircuitState.HALF_OPEN:
                self._success_count += 1
                if self._success_count >= self.half_open_success_threshold:
                    self._state = CircuitState.CLOSED
                    self._failure_count = 0
                    self._success_count = 0
                    self._last_state_change = time.time()
                    logger.info(f"Circuit breaker '{self.name}' recovered: HALF_OPEN -> CLOSED")
            elif self._state == CircuitState.CLOSED:
                self._failure_count = 0

    async def _record_failure(self, exc: Exception) -> None:
        async with self._lock:
            self._half_open_in_flight = False
            self._failure_count += 1
            logger.warning(
                f"Circuit breaker '{self.name}' caught failure ({self._failure_count}/{self.failure_threshold}): {exc}"
            )
            if self._state == CircuitState.HALF_OPEN:
                # Probe failed, trip back to OPEN immediately
                self._state = CircuitState.OPEN
                self._last_state_change = time.time()
                self._success_count = 0
                logger.error(f"Circuit breaker '{self.name}' probe failed: HALF_OPEN -> OPEN")
            elif self._failure_count >= self.failure_threshold and self._state == CircuitState.CLOSED:
                self._state = CircuitState.OPEN
                self._last_state_change = time.time()
                logger.error(
                    f"Circuit breaker '{self.name}' tripped: CLOSED -> OPEN for {self.recovery_timeout}s"
                )

    def reset(self) -> None:
        """Manually reset the circuit breaker to clean CLOSED state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_state_change = time.time()

    def get_metrics(self) -> Dict[str, Any]:
        """Returns diagnostic metrics for health checks and observability."""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "failure_threshold": self.failure_threshold,
            "time_until_retry_seconds": round(self.time_until_retry, 2),
            "recovery_timeout_seconds": self.recovery_timeout
        }


# Global Provider-Specific Circuit Breakers
groq_breaker = CircuitBreaker("groq_api", failure_threshold=5, recovery_timeout=30.0)
openrouter_breaker = CircuitBreaker("openrouter_api", failure_threshold=5, recovery_timeout=30.0)
