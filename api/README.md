# Backend API Module (`/api`)

The `api/` directory contains the core Python 3.12 / FastAPI backend application for NityaGeeta. Running on **Port 8000**, it handles parallel LLM execution, scripture RAG (Retrieval-Augmented Generation), text processing, search term expansion, tone sanitization, and database interactions across PostgreSQL, Redis, and Weaviate Cloud.

---

## Directory Structure & Module Breakdown

```
api/
├── main.py                     # FastAPI application entry point & REST endpoints
├── config.py                   # Environment configuration & credential manager
└── services/
    ├── rag_engine.py           # Core RAG orchestrator & synthesis pipeline
    ├── verse_index.py          # In-memory verse index, tokenization & synonym scoring
    ├── llm_client.py           # Multi-key Groq rotation & OpenRouter API gateway
    ├── dataset_cache.py        # Canonical scripture dataset loader & OCR unwrapping
    ├── prompt_builder.py       # Brain persona prompts & Judge evaluator rules
    └── web_search.py           # Async DuckDuckGo web search fetcher
```

---

## Detailed File Specifications

### 1. `api/main.py` — Application Entry Point & API Router
* **Role**: Initializes the FastAPI ASGI application, configures CORS middleware, defines Pydantic validation schemas, and exposes all HTTP endpoints.
* **Key Components**:
  * **CORS Middleware**: Explicitly allows requests from `http://localhost:1870` and `http://localhost:3000` to prevent cross-origin browser blocks.
  * **Pydantic Models**: `ChatRequest`, `SessionSaveRequest`, `DeleteSessionRequest` for payload validation.
  * **REST Endpoints**:
    * `POST /api/v1/chat`: Primary endpoint executing the asynchronous RAG engine.
    * `POST /api/v1/sessions/save`: Non-blocking endpoint persisting session logs to PostgreSQL.
    * `GET /api/v1/sessions/{email}`: Fetches all chat sessions for a specific user.
    * `DELETE /api/v1/sessions/{id}`: Deletes a specific conversation thread.
    * `GET /api/v1/health`: Health check endpoint verifying database connectivity.

### 2. `api/config.py` — Environment & Configuration Manager
* **Role**: Loads and validates environment variables from `.env` files using `python-dotenv`.
* **Key Credentials Managed**:
  * **Groq Key Rotation Array**: `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`.
  * **OpenRouter Gateway**: `OPENROUTER_API_KEY`.
  * **Databases**: `DATABASE_URL` (Neon PostgreSQL), `REDIS_URL` (Local Docker Redis), `WEAVIATE_URL` & `WEAVIATE_API_KEY` (Weaviate Cloud).

### 3. `api/services/rag_engine.py` — Core RAG Orchestrator
* **Role**: Coordinates the entire retrieval and generation pipeline.
* **Execution Flow**:
  1. Performs fast in-memory verse lookup (<2ms) via `verse_index.py`.
  2. Expands search terms via fast LLM if initial keyword matches are weak.
  3. Uses `asyncio.gather()` to concurrently execute the 5-Model Parallel AI Ensemble and DuckDuckGo web search.
  4. Triggers the automated Judge Evaluator (`evaluate_with_judge_model`) to score all candidate answers (0–100).
  5. Synthesizes winning model insights and live web context (`synthesize_dual_source_response`).
  6. Sanitizes tone using regex rules (`sanitize_response_tone`) to strip preachy filler and symbol clutter.

### 4. `api/services/verse_index.py` — In-Memory Verse Index & Keyword Engine
* **Role**: Loads all 700 Bhagavad Gita Shlokas directly into Python RAM on server startup for sub-2ms lookup speed.
* **Key Features**:
  * **Synonym Expansion (`SYN`)**: Maps modern terms (e.g. *partner*, *business*, *fear*, *burnout*) to traditional Sanskrit concepts.
  * **Exact Keyword Weighting**: Multiplies primary exact query term scores by `6.0x` over generic stem fallbacks to ensure distinct shloka matching.

### 5. `api/services/llm_client.py` — Multi-Model AI Client Manager
* **Role**: Interfaces with LLM providers using non-blocking asynchronous HTTP calls (`httpx`).
* **Key Features**:
  * **Groq Round-Robin Rotation**: Cycles through `GROQ_API_KEY_1, 2, 3` to bypass per-minute rate limits during multi-model parallel runs.
  * **OpenRouter Gateway Client**: Sends unified requests to DeepSeek Chat V3, Mistral Small 24B, Gemma 3 12B, and GPT-4o Mini.

### 6. `api/services/dataset_cache.py` — Dataset Loader & OCR Processor
* **Role**: Loads and caches canonical JSON files (`gita_press_translated.json`, `boss_ocr.json`, `Winthrop Sargeant`).
* **Key Features**:
  * `unwrap_ocr_paragraphs`: Unwraps artificial single OCR line breaks into smooth continuous prose lines while preserving paragraph breaks (`\n\n`).
  * `search_boss_items`: Returns page-level scripture items with exact book page numbers for the Scripture Reader Modal.

### 7. `api/services/prompt_builder.py` — System Prompts & Persona Guidelines
* **Role**: Constructs tailored system prompts for all 5 AI Brains, the Judge Evaluator, and the Cross-Model Synthesizer.
* **Key Rule Set**: Enforces organic prose flows and natural paragraphs, eliminating rigid 6-item numbered list constraints.

### 8. `api/services/web_search.py` — Async Web Search Fetcher
* **Role**: Executes asynchronous search queries against DuckDuckGo using `httpx`.
* **Key Features**: Parses live web search result snippets to provide modern context alongside ancient scripture retrieval.

---

## Running the API Backend

```bash
# Activate Python virtual environment
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Run Uvicorn dev server on Port 8000
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API interactive documentation is accessible at:
* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
