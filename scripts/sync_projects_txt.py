#!/usr/bin/env python3
r"""
Sync updated NityaGeeta project specifications to Projects.txt files in:
1. C:\Users\Meeta\Downloads\Projects.txt
2. C:\Users\Meeta\OneDrive - Algonquin College\Resume\Files\Projects.txt
"""

import sys
from pathlib import Path

TARGET_FILES = [
    Path(r"C:\Users\Meeta\Downloads\Projects.txt"),
    Path(r"C:\Users\Meeta\OneDrive - Algonquin College\Resume\Files\Projects.txt"),
]

NITYAGEETA_BLOCK = """1. NityaGeeta
System Architecture & Purpose: NityaGeeta (hosted at nityageeta.tech) is a high-concurrency, grounded scriptural intelligence platform engineered to eliminate LLM hallucinations and provide sub-second access (<300ms TTFT) to the Srimad Bhagavad Gita and Vedic commentaries. It implements a decoupled client-server architecture combining a Next.js 16 App Router (React 19, TypeScript 7.0, Tailwind CSS v4) frontend with a high-throughput, asynchronous FastAPI backend running a 6-Brain multi-model parallel RAG retrieval pipeline (Groq GPT-OSS 120B, Qwen 27B, OpenRouter DeepSeek V3, Mistral 24B, Gemma 3 12B, GPT-4o mini), Groq LLM Judge arbitration, cross-model and dual-source web synthesis, Redis Streams real-time event aggregation, DeepEval scripture faithfulness evaluation, "The Steve Jobs Follow-Up Engine", and real-time Server-Sent Events (SSE) streaming.

Core Tech Stack:
Languages & Runtimes: Python 3.11/3.12 (CPython, Uvicorn, Asyncio), TypeScript 7.0 (TypeScript 7.0.2 with native relative module paths), Node.js 20.x/22.x, SQL.
Backend & APIs: FastAPI, Pydantic v2, SQLAlchemy ORM, SQLite / PostgreSQL (psycopg2-binary), Redis Streams (redis-py XADD event streaming), Passlib (bcrypt), HTTPX, AsyncGroq, SlowAPI rate-limiting (30 req/min), DeepEval (RAG Triad & Scripture Context Precision metrics).
Frontend & Styling: Next.js 16 (16.3.8, 23 static/dynamic routes, Turbopack, 0 build errors), React 19 (19.3.0), Tailwind CSS v4 (migrated with @tailwindcss/postcss and @config directive), Framer Motion 14, Lucide React, Nodemailer 10.
AI, RAG & Search: In-memory BM25Okapi (Robertson-Sparck Jones IDF with document-length normalization k1=1.5, b=0.75), Reciprocal Rank Fusion (k=60), Groq API (multi-key round-robin rotation, openai/gpt-oss-120b, qwen/qwen3.8-27b), OpenRouter multi-model cascade (DeepSeek V3, Mistral 24B, Gemma 3 12B, GPT-4o-mini), Groq LLM Judge arbitration, DuckDuckGo dual-source web synthesis.
Stream Processing & Telemetry: Redis Streams (nityageeta:seeker_stream buffer with maxlen=25000), bounded in-memory sliding buffer fallback (deque maxlen=10000), 18-chapter contemplative motif taxonomy aggregation, and browser IntersectionObserver microsecond dwell-time tracking.
Curated 25 Production Stack Tags: next.js, react, fastapi, python, typescript, rag, redis, postgresql, docker, tailwindcss, framer-motion, groq, bm25, sse, pydantic, pytest, llm, generative-ai, nlp, artificial-intelligence, stream-processing, github-actions, playwright, deepeval, postman.
Cloud & Lakehouse Integration: Production domain registered at nityageeta.tech, Google Cloud Platform (Cloud Run container deployment target, gcloud SDK, BigQuery data-agent-kit MCP server), Databricks SDK for Python (live handshake to AWS Databricks workspace dbc-2e2f6ec3-1a7d.cloud.databricks.com).
Infrastructure & Protocols: Docker (multi-stage builds, non-root execution appuser UID 10001), Docker Compose (FastAPI backend, Next.js frontend, Redis 7 appendonly, PostgreSQL 16), HTTP/1.1 & HTTP/2, Server-Sent Events (text/event-stream), REST, Authenticated SMTP TLS.

Key Modules / Routing / APIs:
api/main.py: Central routing layer exposing 17 asynchronous endpoints including real-time SSE streaming (POST/GET /api/v1/chat/stream), telemetry stream batch ingestion (POST /api/v1/telemetry/stream), seeker affinity profile (GET /api/v1/telemetry/affinity/{user_id}), blocking fallback chat (POST /api/v1/chat), lexical search (POST /api/v1/search), canonical PDF serving (GET /api/v1/pdf/{source_id}), and stateful session management (/api/v1/sessions/*).
api/services/rag_engine.py: Asynchronous RAG orchestration handling 6-model parallel fan-out, LLM judge arbitration, and SSE chunk generation (event: citations, event: status, event: token, event: guardrail, event: followup, event: done).
api/services/llm_client.py: Multi-provider LLM orchestration with round-robin Groq key rotation, asynchronous non-blocking token streaming with AsyncGroq, 6-brain parallel execution (openai/gpt-oss-120b, qwen/qwen3.8-27b, DeepSeek V3, Mistral 24B, Gemma 3 12B, GPT-4o mini), Groq LLM Judge evaluation, cross-model candidate enrichment, and live web synthesis.
api/services/deepeval_evaluator.py: Automated DeepEval RAG validation suite calculating Faithfulness, Answer Relevancy, Hallucination Suppression, and Scripture Context Precision against Sanskrit canonical truth.
frontend/src/app/api/contact/route.ts & download/route.ts: Multi-layer contact and bug reporting pipeline with dual-layer sliding window IP/email rate limiting, RFC 5322 validation, authenticated SMTP transport, two-way Cupertino-styled HTML email dossiers (seeker confirmation + admin telemetry report with IP, UA, viewport, referrer), triple-layer attachment delivery (MIME attachment, inline CID rendering, local disk persistence to public/uploads/contact/${ticketId} with direct web download buttons), and secure local file download proxy route with directory traversal defense.
api/services/telemetry_stream.py: Real-time Redis Streams ingestion buffer (XADD), sliding memory buffer fallbacks, 18-chapter motif aggregation, and "The Steve Jobs Follow-Up Engine" generating empathy-first human resonance inquiries paired with 3 verb-led action pathways.
frontend/src/lib/telemetry.ts: Client-side behavioral observer tracking verse card dwell time via IntersectionObserver (0.5 threshold) and silent beacon flushing on visibilitychange/beforeunload.
frontend/src/components/agents/steve-jobs-followup.tsx: Dynamic interactive UI component rendering empathetic resonance checks and verb-led action pills (💡 Go Deeper into Scripture, 🧘 Bring It to Real Life, 📖 Read the Original Sanskrit).
frontend/src/components/ui/architecture-diagrams.tsx: DomainDataModelRelationalTopology interactive architecture diagram on /architecture with 8 normalized entities, 3-column table cards, foreign key hover glow, floating zoom/pan dock (65%-145%), and Mermaid.js erDiagram code generation.
frontend/src/components/GlobalRadialContextMenu.tsx & radial-context-menu.tsx: Radial navigation menu theme synchronization engine utilizing MutationObserver on document.documentElement.classList to eliminate theme inversion lag.
api/services/verse_index.py: O(1) deterministic citation parser (parse_verse_citation), inverted index lookup (_INV), BM25 length-normalized scoring, and multi-source Reciprocal Rank Fusion.
api/services/citation_guardrail.py & circuit_breaker.py: Post-generation citation verification against ground-truth corpus and upstream API circuit breaker state machine (CLOSED, OPEN, HALF-OPEN).
postman/NityaGeeta_Collection.json & postman/NityaGeeta_Environment.json: Complete 17-endpoint Postman API collection with pre-request scripting, dynamic variable chaining (Bearer auth tokens, session IDs), and Newman CI automated test harness.
scripts/test_databricks_connection.py: Automated cloud lakehouse handshake script verifying PAT token authentication, cluster runtime status, and Unity Catalog access against AWS Databricks workspace.

Data / Network Layer:
Relational Schema: SQLite (dev) and PostgreSQL database utilizing UUID primary keys across 8 normalized entities: users, user_preferences, sessions (18-day TTL tokens), chat_conversations, chat_messages, saved_verses, study_notes, and nityageeta:seeker_stream (Redis Streams).
Corpus Ingestion & In-Memory Index: Dual-layer in-memory index over 5 canonical datasets: Gita Press Gorakhpur (W=3.0), Winthrop Sargeant (W=2.5), Gita Sadhak Sanjeevani (W=2.0), Adi Shankaracharya Commentary (W=1.5), and Basics of Sanatan Sanskriti OCR (W=1.0), indexing 5,034 pages and 649 unique shlokas.
Network Topology & Streaming: Containerized bridge network isolating the database from the public gateway, CORS origin whitelisting, and chunked SSE streaming configured with Cache-Control: no-cache and X-Accel-Buffering: no to eliminate reverse-proxy buffering.

Reliability & Edge Cases:
Circuit Breaker Pattern: Asynchronous 3-state state machine isolating LLM upstream rate limits (429/503); trips to OPEN after 5 consecutive failures with a 30s backoff cooldown to prevent event loop starvation.
Citation Verification Guardrail: Automated ground-truth verifier that matches claimed citations against retrieved verses, suppressing hallucinated references from the final output.
Industry-Standard Beta Disclaimer: Centered disclaimer below chat input ("NityaGeeta is in beta and can make mistakes. Please verify with provided scripture sources.") linking directly to canonical /sources to set clear user expectations.
Contact & Feedback Defense: Strict RFC 5322 regex validation, allowed MIME types (png, jpeg, webp, gif), 5MB size limit, max 5 attachments, and in-memory dual-bucket rate limiting (IP & email) with periodic 5-minute cleanup.
DoS & Memory Defense: Pydantic v2 boundary enforcement on all endpoints (question: min 3, max 2000 chars, query: max 200 chars, UUID format validation) preventing memory exhaustion attacks.
Container Security: Multi-stage Docker build utilizing a dedicated non-root execution user (appuser, UID 10001) with automated container health checking via GET /health.
Rate Limiting Defense: SlowAPI rate limiting (30 requests/minute per client IP) mitigating API abuse and quota exhaustion.

Testing & Automation:
Pytest Suite: 66 automated unit and integration tests across 6 test suites:
tests/test_hybrid_rag.py: 26 tests verifying deterministic regex citation extraction, BM25 length normalization penalties, Reciprocal Rank Fusion scoring invariants, and citation guardrail scrubbing.
tests/test_scenarios_matrix.py: 21 tests validating multi-scenario production resilience across 4 operational profiles: Good Day (nominal retrieval & streaming), Busy Day (high concurrency, burst traffic, connection pooling), Rainy Day (fault injection, 429 rate-limits, malformed inputs), and Tuffest Day (catastrophic upstream timeouts, circuit breaker trips, graceful degradation).
tests/test_resilience.py: 8 tests verifying circuit breaker state transitions, SSE frame protocol wire format, Pydantic input boundary rejection, and healthcheck contracts.
tests/test_telemetry_stream.py: 6 tests validating Redis stream ingestion, bounded in-memory sliding buffer fallbacks, seeker affinity motif aggregation across the 18 chapters, Steve Jobs 3-pathway follow-up generation, and FastAPI telemetry endpoints.
tests/test_qa_suite.py: 4 tests validating end-to-end QA contracts and backend regressions.
tests/test_memory_stack.py: 1 test validating NetworkX conversation graph state tracking.
Playwright E2E Browser Suite: 5 automated end-to-end browser tests (frontend/tests/scenarios.spec.ts & tests/test_playwright_e2e.py) validating dropzone screenshot attachments, client-side RFC email validation, rapid multi-route switching without hydration errors, and in-flight dispatch lockouts.
Postman & Newman API Suite: 17 automated endpoint validation tests (postman/NityaGeeta_Collection.json) orchestrated via Newman CLI with automated HTML/JSON test execution reporting (QA/reports/api_test_execution_report.json).
Total Test Suite: 71 automated tests (66 Pytest + 5 Playwright E2E) with 100% pass rate in CI/CD.
4-Pillar Quality Protocol: Mandatory verification protocol enforcing Pillar 1 (QA & QT automated testing), Pillar 2 (Cupertino design tokens #FAF7F2, #1E1B18, #C25E38 and UI checking), Pillar 3 (CyberSecurity defensive bounds, SSRF proxy guards, and non-root execution), and Pillar 4 (FrontEnd Analyser next build with 0 compilation errors across all 23 routes).
Frontend Build Gate: Next.js 16 production build with 0 TypeScript errors and 0 lint warnings across all 23 routes.
CI/CD Pipeline: Automated GitHub Actions workflow (.github/workflows/ci.yml) triggering on pushes and pull requests across main to execute linting, TypeScript compilation checks, and the full Pytest test suite.
"""

def update_file(path: Path):
    if not path.exists():
        print(f"Skipping non-existent file: {path}")
        return
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Locate where "2. SauceDemo QA Test Automation" begins
    target_marker = "2. SauceDemo QA Test Automation & CI/CD Framework"
    if target_marker not in content:
        print(f"Error: Target marker '{target_marker}' not found in {path}")
        return

    _, remaining = content.split(target_marker, 1)

    new_content = NITYAGEETA_BLOCK.strip() + "\n\n" + target_marker + remaining

    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_content)

    print(f"Successfully updated {path} ({len(new_content)} characters written)")

def main():
    for target in TARGET_FILES:
        update_file(target)

if __name__ == "__main__":
    main()
