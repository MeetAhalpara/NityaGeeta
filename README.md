# NityaGeeta (नित्यगीता)

> **"Nitya" (Sanskrit: नित्य)** translates to *eternal* or *perpetual*.

**NityaGeeta** is an open-source, multi-LLM ensemble platform and Retrieval-Augmented Generation (RAG) system for authenticated Vedic scripture guidance. It bridges ancient wisdom with modern challenges (stress, duty, relationships, career decisions) by delivering scripture-grounded responses with **verifiable, page-by-page citations** back to authoritative printed commentaries.

---

## System Architecture Overview

NityaGeeta uses a **decoupled polyglot architecture**. The client UI runs on **Next.js 15 / Node.js (Port 1870)**, while the heavy AI execution, RAG pipeline, and text processing run on a **FastAPI / Python 3.12 Backend (Port 8000)**.

```text
[ CLIENT BROWSER ]
       │
       │ HTTP REST API (JSON Payload over Port 1870 & Port 8000)
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND LAYER (Node.js 20 / Next.js 15 / React 19)             │
│ • Path: /frontend (Port 1870)                                   │
│ • UI Engine: Tailwind CSS 3.4 + Framer Motion GPU Animations    │
│ • Auth: NextAuth.js (Google OAuth 2.0)                          │
│ • Features: Radial Context Menu, TextBlink Loading, Page Modal  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ POST /api/v1/chat
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND LAYER (Python 3.12 / FastAPI / Uvicorn ASGI)            │
│ • Path: /api (Port 8000)                                        │
│ • Concurrency: asyncio.gather() parallel execution              │
│ • In-Memory Speed: 700 Bhagavad Gita Shlokas in RAM (<2ms)      │
│ • Web Context: DuckDuckGo Async Search Integration              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ PostgreSQL      │     │ Redis           │     │ Weaviate Cloud   │
│ (Neon Cloud)    │     │ (Local Docker)  │     │ (Vector Engine)  │
│ Session Logs &  │     │ <1ms Cache &    │     │ Semantic Meaning │
│ Chat History    │     │ Rate Limits     │     │ Concept Search   │
└─────────────────┘     └─────────────────┘     └──────────────────┘
```

---

## Tri-Database Strategy

NityaGeeta leverages 3 specialized databases, each optimized for speed, cost efficiency, and reliability:

1. **PostgreSQL (Neon Cloud)** — *Relational Storage & Session Persistence*:
   - Permanently stores user chat threads (`sessions`), message logs, winning model names, Judge scorecards, and page-level citations.
   - Allows users to log in from any device and reload past dialogues.

2. **Redis (Local Docker Container on Port 1870)** — *Microsecond Caching & Rate Limiting*:
   - Key-value store running on RAM (`redis:7.2-alpine`).
   - Serves cached answers in **<1ms** for repeated queries, saving up to **90% in LLM API token costs**.
   - Enforces IP rate limiting to prevent spam and server overload.

3. **Weaviate (Cloud Vector Database)** — *Semantic Scripture Search*:
   - High-dimensional vector database (`weaviate.io`).
   - Performs concept-based mathematical search (`nearVector`) across all 700 Shlokas and commentaries, matching user intent even when phrasing differs (e.g. *"burnout"* ➔ *"attachment / mental fatigue"*).

---

## 5-Model Parallel AI Ensemble & Judge Evaluator

When a user submits a prompt, the backend uses Python's `asyncio.gather()` to concurrently query **5 specialized LLMs** along with live web search:

* **Brain 1 (Groq Llama 3.3 70B)**: Primary Synthesis & Core Versatile Reasoning.
* **Brain 2 (DeepSeek Chat V3 via OpenRouter)**: Advaita Vedanta Perspective (Non-duality & Shankara's commentary).
* **Brain 3 (Mistral Small 24B via OpenRouter)**: Sadhana Perspective (Practical spiritual discipline & Ramsukhdas's insights).
* **Brain 4 (Gemma 3 12B via OpenRouter)**: Scientific & Analytical Perspective (Physics, logic, and modern models).
* **Brain 5 (GPT-4o Mini via OpenRouter)**: Cognitive Psychology Perspective (Mental health, habits, and modern frameworks).
* **Automated Judge Evaluator (Groq Llama 3.1 8B)**: Evaluates all 5 candidate answers on a 0–100 scale based on scriptural accuracy, clarity, and groundedness.

---

## Unique UI Features & User Experience

* **Radial Context Menu**: Spring-animated SVG circular menu supporting Light/Dark modes, right-click closing, Copy (highlight-aware), Paste, In-Place Refresh, New Dialogue, Theme Toggle, Home.
* **TextBlink Loading**: Smooth fading pulse text indicator replacing heavy spinners.
* **Interactive Scripture Reader Modal**: Complete untruncated book pages with external Sanskrit/Hindi translation links.
* **Smart Resource Referrals**: Automated recommendations for Vishnu Puran (cosmology), Mahabharat (Gita origin), and Veducation Free Library.

---

## Project Directory Structure

```
NityaGeeta/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI/CD Pipeline
├── api/                                    # Python / FastAPI Backend
│   ├── main.py                             # FastAPI routes & CORS configuration
│   ├── config.py                           # Environment configuration
│   └── services/
│       ├── rag_engine.py                   # RAG orchestrator & synthesis pipeline
│       ├── verse_index.py                  # In-memory verse keyword index & weighting
│       ├── llm_client.py                   # Groq & OpenRouter multi-key LLM clients
│       ├── dataset_cache.py                # Dataset loader & OCR paragraph unwrapping
│       └── web_search.py                   # DuckDuckGo async web search
│
├── frontend/                               # Next.js 15 / React 19 Frontend
│   ├── src/
│   │   ├── app/                            # App Router routes (/app, /app/search/[id])
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── radial-context-menu.tsx # Custom SVG circular context menu
│   │   │   │   ├── avatar-group.tsx        # Perplexity-style citation drawer & page modal
│   │   │   │   └── text-blink.tsx          # Fading pulse loading indicator
│   │   │   └── motion/                     # Framer Motion GPU animation wrappers
│   │   └── lib/                            # NextAuth configuration & utilities
│   ├── package.json
│   └── tailwind.config.ts
│
├── data/
│   └── output/
│       ├── gita_editions/                  # 4 Canonical Gita JSON datasets
│       └── veducation_books/               # BOSS OCR scripture dataset
├── details.md                              # Deep-dive internal technical architecture guide
├── docs/                                   # Investor pitch & Q&A documentation
│   ├── Pitch.txt                           # Executive pitch & Lean Canvas Q&A
│   └── Q&A.txt                             # Master test suite & prompt logs
├── docker-compose.yml                      # Redis local container definition
└── requirements.txt                        # Backend Python dependencies
```

---

## Getting Started

### 1. Prerequisites
* **Node.js 20+** & **npm**
* **Python 3.12+**
* **Docker Desktop** (for Redis container)
* **Groq API Keys**, **OpenRouter API Key**, **Neon PostgreSQL**, & **Weaviate Cloud** credentials

### 2. Backend Setup
```bash
# Clone repository
git clone https://github.com/MeetAhalpara/NityaGeeta.git
cd NityaGeeta

# Create & activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Redis container
docker compose up -d

# Run FastAPI backend server (Port 8000)
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install --legacy-peer-deps

# Run Next.js dev server (Port 1870)
npm run dev
```

Open [http://localhost:1870](http://localhost:1870) in your browser.

---

## Environment Variables

Create `.env` in root for Backend:
```env
GROQ_API_KEY_1=gsk_...
GROQ_API_KEY_2=gsk_...
GROQ_API_KEY_3=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...
DATABASE_URL=postgresql://user:pass@ep-host.neon.tech/neondb
REDIS_URL=redis://127.0.0.1:1870
WEAVIATE_URL=https://instance.cloud.weaviate.io
WEAVIATE_API_KEY=key
```

Create `frontend/.env.local` for Frontend:
```env
NEXT_PUBLIC_AUTH_API_BASE=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:1870
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Continuous Integration (CI)

Every commit pushed to `main`, `master`, or `develop` triggers GitHub Actions (`.github/workflows/ci.yml`) to automatically verify:
1. **Python Code Syntax**: `compileall api/` & RAG tokenization tests.
2. **Frontend Type Check**: Strict TypeScript verification (`npx tsc --noEmit`).
3. **Next.js Production Build**: `npm run build` validation.
4. **Dataset Integrity**: Ensures all canonical JSON scripture files exist and parse cleanly.

---

## License & Acknowledgments

* **Text Rights**: Source Sanskrit and Hindi texts belong to Gita Press Gorakhpur and respective historical commentators.
* **Project License**: MIT License.
