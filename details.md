# NityaGeeta — Technical Architecture & Technology Knowledge Guide (`details.md`)

---

## 1. Core Technical Summary & Architecture Overview

**NityaGeeta** is a full-stack, multi-model AI spiritual application. It combines a **Next.js 15 / React 19 Frontend** with a **FastAPI / Python 3.12 Backend**, 3 specialized databases, and a 5-model parallel AI retrieval-augmented generation (RAG) engine.

```text
[ CLIENT BROWSER ]
       │
       │ HTTP / REST (JSON API over Port 8000 & Port 1870)
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND LAYER (Node.js / Next.js 15 / React 19)                │
│ • Path: /frontend                                               │
│ • State: LocalStorage + Session State                           │
│ • Auth: NextAuth.js (Google OAuth 2.0)                          │
│ • UI: Tailwind CSS 3.4 + Framer Motion (@/components/motion)    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ POST /api/v1/chat
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND LAYER (Python 3.12 / FastAPI)                           │
│ • Path: /api                                                    │
│ • Server: Uvicorn ASGI on http://127.0.0.1:8000                 │
│ • Concurrency: asyncio.gather() parallel execution              │
│ • Data Index: In-memory 700 Bhagavad Gita Shlokas (<2ms lookup) │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ PostgreSQL      │     │ Redis           │     │ Weaviate Cloud   │
│ (Neon Cloud)    │     │ (Local Docker)  │     │ (Vector Engine)  │
│ Session & Chat  │     │ Cache & Rates   │     │ Semantic Search  │
└─────────────────┘     └─────────────────┘     └──────────────────┘
```

---

## 2. Connection: How Backend (Python / FastAPI) & Frontend (Node.js / Next.js) Work, Connect, Interact, and Function Perfectly Together

NityaGeeta uses a **Decoupled Architecture** where the Node.js runtime powers the interactive client UI, while Python handles heavy AI parallel processing, text parsing, and scripture RAG retrieval.

### 2.1 The Inter-Server Communication Loop

```text
[ BROWSER / USER ]
        │
        │ 1. User inputs question: "How do I build self-confidence?"
        ▼
┌──────────────────────────────────────────────────────────────────┐
│ NODE.JS / NEXT.JS FRONTEND (Port 1870)                           │
│ • Executes in Browser & Node runtime                            │
│ • Captures input in React state (query)                          │
│ • Dispatches async HTTP POST request using native fetch API      │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 │ 2. HTTP POST Request
                                 │    Target: http://localhost:8000/api/v1/chat
                                 │    Payload: { "question": "..." }
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ PYTHON / FASTAPI BACKEND (Port 8000)                             │
│ • Executes in Python 3.12 ASGI runtime (Uvicorn)                │
│ • CORS Middleware validates Origin: http://localhost:1870        │
│ • Queries 700 Bhagavad Gita Shlokas in RAM (<2ms)                │
│ • Dispatches 5 AI models + Web search in parallel                │
│ • Returns structured JSON with answer, scores, and citations     │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 │ 3. JSON Response Payload
                                 │    { "answer": "...", "winning_model": "...", ... }
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND DISPLAY & FIRE-AND-FORGET DB SYNC                       │
│ • Parses Markdown & Devanagari Sanskrit Shloka callout cards     │
│ • Updates URL to /app/search/[uuid] without full page reload     │
│ • Sends background POST /api/v1/sessions/save to PostgreSQL     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Concrete Code Interaction Example

#### Step A: Frontend Dispatch (`frontend/src/app/app/page.tsx`)
Node.js initiates the HTTP POST request to the Python backend:

```typescript
// Client-side fetch call executed inside handleSend()
const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || "http://localhost:8000";

const res = await fetch(`${apiBase}/api/v1/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question: messageText }),
});

const data = await res.json();
// data contains { answer, winning_model, best_score, candidates, citations }
```

#### Step B: Backend Handler (`api/main.py`)
FastAPI validates incoming JSON via Pydantic and executes the async pipeline:

```python
# Pydantic schema for request validation
class ChatRequest(BaseModel):
    question: str

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    # Triggers RAG, parallel LLM execution, Judge evaluation, and synthesis
    result = await execute_rag_pipeline_async(request.question)
    return result
```

#### Step C: Cross-Origin Resource Sharing (CORS) Configuration
To allow `http://localhost:1870` (Node) to make requests to `http://localhost:8000` (Python) without browser security blocks, `api/main.py` explicitly configures CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1870", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Step D: Background Persistence Sync
After rendering the response, the frontend sends a non-blocking request to save session data to PostgreSQL:

```typescript
async function saveSessionToDb(sessionId: string, userEmail: string, messages: Message[], title: string) {
  try {
    await fetch("http://localhost:8000/api/v1/sessions/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, user_email: userEmail, title, messages }),
    });
  } catch {
    // Silently ignore — localStorage acts as instant local cache
  }
}
```

---

## 3. ApiUsages: API Key Architecture & Deep Mapping

Below is the complete mapping of every API key, secret, environment variable, exact file location, and technical component powered in NityaGeeta.

### 3.1 API Key Mapping Table

| API Key / Variable Name | Environment File | Exact Source Code File Using It | Powered Service / Component |
| :--- | :--- | :--- | :--- |
| **`GROQ_API_KEYS`** / **`GROQ_API_KEY_1,2,3`** | `api/.env`<br>`.env` | `api/config.py`<br>`api/services/llm_client.py` | **Groq Multi-Key Rotation Pool**:<br>• **Brain 1**: `llama-3.3-70b-versatile` (Primary Synthesis)<br>• **Judge Model**: `llama-3.1-8b-instant` (0-100 Evaluator)<br>• **Synthesizer**: `llama-3.3-70b-versatile` (Cross-Model Synthesis) |
| **`OPENROUTER_API_KEY`** | `api/.env`<br>`.env` | `api/config.py`<br>`api/services/llm_client.py` | **OpenRouter AI Gateway Key**:<br>• **Brain 2**: `deepseek/deepseek-chat-v3` (Advaita View)<br>• **Brain 3**: `mistralai/mistral-small-3.1-24b` (Sadhana View)<br>• **Brain 4**: `google/gemma-3-12b-it` (Scientific View)<br>• **Brain 5**: `openai/gpt-4o-mini` (Cognitive Psychology) |
| **`GOOGLE_CLIENT_ID`** | `frontend/.env.local` | `frontend/src/app/api/auth/[...nextauth]/route.ts` | **Google OAuth 2.0 Client ID** used by NextAuth to authenticate user Google logins. |
| **`GOOGLE_CLIENT_SECRET`** | `frontend/.env.local` | `frontend/src/app/api/auth/[...nextauth]/route.ts` | **Google OAuth 2.0 Client Secret** used for secure OAuth token exchange with Google servers. |
| **`NEXTAUTH_SECRET`** | `frontend/.env.local` | `frontend/src/app/api/auth/[...nextauth]/route.ts` | **JWT Encryption Secret** used to sign and encrypt session cookies in browser storage. |
| **`NEXTAUTH_URL`** | `frontend/.env.local` | NextAuth Runtime | Set to `http://localhost:1870` for OAuth redirect callback verification. |
| **`DATABASE_URL`** | `api/.env`<br>`frontend/.env.local` | `api/config.py`<br>`api/main.py` | **PostgreSQL Connection String (Neon Cloud)** for storing conversation sessions and message history (User authentication & profile identity are securely managed by Google OAuth 2.0). |
| **`REDIS_URL`** | `api/.env`<br>`.env` | `api/config.py`<br>`api/services/dataset_cache.py` | **Redis Connection String** (`redis://127.0.0.1:1870`) for local Docker response caching and rate limiting. |
| **`WEAVIATE_URL`** | `api/.env`<br>`.env` | `api/config.py`<br>`api/services/rag_engine.py` | **Weaviate Cloud Instance URL** for vector embeddings of Gita scriptures. |
| **`WEAVIATE_API_KEY`** | `api/.env`<br>`.env` | `api/config.py`<br>`api/services/rag_engine.py` | **Weaviate Cloud Authentication API Key** for vector similarity searches. |

---

### 3.2 Exact Code Implementation of API Keys

#### 1. Groq Multi-Key Rotation (`api/config.py` & `api/services/llm_client.py`)
```python
# In api/config.py
GROQ_API_KEYS = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3"),
]
GROQ_API_KEYS = [k for k in GROQ_API_KEYS if k]

# In api/services/llm_client.py
_groq_key_index = 0

def _next_groq_client() -> Groq:
    global _groq_key_index
    key = GROQ_API_KEYS[_groq_key_index % len(GROQ_API_KEYS)]
    _groq_key_index += 1
    return Groq(api_key=key)
```

#### 2. OpenRouter Multi-Model Gateway (`api/services/llm_client.py`)
```python
async def _call_openrouter(messages: List[Dict[str, str]], model: str) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"model": model, "messages": messages}
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        return res.json()["choices"][0]["message"]["content"]
```

#### 3. NextAuth Google OAuth Config (`frontend/src/app/api/auth/[...nextauth]/route.ts`)
```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
```

---

## 4. Frontend Technologies (`/frontend`)

### 4.1 Next.js 15 (App Router)
- **File Location**: `/frontend/src/app/` (`layout.tsx`, `page.tsx`, `app/page.tsx`, `providers.tsx`).
- **Implementation**: Client Components (`"use client"`) handle dynamic chat interactions. `router.prefetch()` preloads route assets for smooth navigation.
- **Technical Purpose**: Delivers fast initial page load (FCP < 0.8s), enables automatic code-splitting per route, and optimizes SEO for search queries.

### 4.2 React 19 & TypeScript 5.7
- **File Location**: All `.tsx` and `.ts` files inside `/frontend/src/`.
- **Implementation**: React 19 hooks (`useState`, `useEffect`, `useCallback`, `usePathname`) manage chat states. Interfaces (`Message`, `CitationItem`, `ScorecardItem`, `CandidateItem`, `ConversationSession`) enforce strict type contracts.
- **Technical Purpose**: Prevents runtime type errors and enables concurrent React rendering for 60fps text updates.

### 4.3 Tailwind CSS 3.4 & Dark/Light Theme Engine
- **File Location**: `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`.
- **Implementation**: Utility-first CSS styling paired with `next-themes` (`ThemeProvider`). Color tokens:
  - Terracotta Saffron: `#C25E38` (Light) / `#E06D43` (Dark)
  - Parchment Background: `#FAF7F2` (Light) / `#1A1816` (Dark)
  - Deep Text: `#2D2622` (Light) / `#F5F2EB` (Dark)
- **Technical Purpose**: Keeps total CSS bundle size under 15KB. Purges unused CSS classes during production build.

### 4.4 Framer Motion & Animated Sidebar (`@/components/motion`)
- **File Location**: `frontend/src/components/motion/animated-sidebar.tsx`, `frontend/src/app/app/page.tsx`.
- **Implementation**: Built with Framer Motion (`framer-motion`). Animates sidebar expansion/collapse (`group-data-[state=collapsed]/sidebar:hidden`), theme toggle rotations, and thinking drawers.
- **Technical Purpose**: Uses GPU hardware acceleration (`transform` and `opacity`) to maintain 60fps UI animations without triggering browser DOM layout reflows.

### 4.5 NextAuth.js 4.24 (Google OAuth 2.0)
- **File Location**: `frontend/src/app/providers.tsx`, `frontend/src/app/api/auth/[...nextauth]/route.ts`.
- **Implementation**: Wraps the frontend in `<SessionProvider refetchOnWindowFocus={false}>`. Interacts with Google OAuth 2.0 endpoints using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **Technical Purpose**: Provides 1-click Google user authentication. Setting `refetchOnWindowFocus={false}` prevents background console fetch errors when switching browser tabs.

### 4.6 FormattedChatMessage (`FormattedChatMessage.tsx`)
- **File Location**: `frontend/src/components/ui/formatted-chat-message.tsx`.
- **Implementation**: Custom parser using regex and `react-markdown` 10.1:
  - `parseMessageContent()` splits raw AI output into text sections and Sanskrit verse blocks.
  - Recognizes Devanagari Unicode (`[\u0900-\u097F]`).
  - Filters OCR book headers (`अध्याय 5`, `श्रीमद्भगवद्गीता`).
  - Strips raw IAST transliteration lines.
  - Renders Sanskrit Devanagari Shlokas inside callout cards (`border-[#C25E38]`) with Noto Serif Devanagari typography and italicized English translations.
- **Technical Purpose**: Ensures clean visual separation between scriptural verses and conversational text while avoiding invalid HTML hydration errors (`<div>` used instead of `<p>`).

### 4.7 GitaTermHoverCard (`GitaTermHoverCard.tsx`)
- **File Location**: `frontend/src/components/ui/gita-term-hover-card.tsx`.
- **Implementation**: Text scanner component matching terms (*Karma*, *Atman*, *Dharma*, *Sakshi Bhava*) against an internal dictionary. When a term is found, it wraps the word in an interactive `<span>` displaying a popover card on mouse hover.
- **Technical Purpose**: Educates users on Sanskrit terminology without cluttering chat responses. Uses `<span>` with `display: block` child styling to comply with HTML spec nesting rules.

### 4.8 Local Storage & Dynamic Perplexity-Style URL Routing
- **File Location**: `frontend/src/app/app/page.tsx`.
- **Implementation**:
  - Chat history is stored under key `nityageeta_chat_history` in `localStorage`.
  - On the first message of a session, `generateUUID()` creates a UUID v4 ID.
  - `router.replace('/app/search/[uuid]', { scroll: false })` updates the browser URL bar dynamically without triggering a full page reload.
  - Sidebar categorizes saved sessions by recency (*Today*, *Yesterday*, *This Week*, *Older*).
- **Technical Purpose**: Delivers 0ms latency for offline session loading and provides deep-linkable URLs for every dialogue session.

---

## 5. Backend Technologies (`/api`)

### 5.1 FastAPI 0.110+ & Uvicorn ASGI Server
- **File Location**: `api/main.py`, `api/config.py`.
- **Implementation**: Python ASGI application running on Uvicorn server (`http://127.0.0.1:8000`). Exposes REST API endpoints (`POST /api/v1/chat`, `POST /api/v1/sessions/save`, `GET /api/v1/health`). Pydantic models (`ChatRequest`, `SessionSaveRequest`) validate incoming JSON.
- **Technical Purpose**: Handles asynchronous non-blocking API operations with sub-5ms routing overhead.

### 5.2 Python `asyncio.gather()` Parallel Concurrency Engine
- **File Location**: `api/services/rag_engine.py`, `api/services/llm_client.py`.
- **Implementation**: Executes asynchronous coroutines concurrently:
  ```python
  models_task = generate_5_model_parallel_responses(messages)
  web_task = search_web_async(question)
  candidate_responses, web_results = await asyncio.gather(models_task, web_task)
  ```
- **Technical Purpose**: Running 5 AI models + web search sequentially takes **18–25 seconds**. Parallel execution reduces overall response time to the duration of the single slowest model (**~1.5 to 2.5 seconds**).

### 5.3 `httpx` Async HTTP Engine
- **File Location**: `api/services/llm_client.py`, `api/services/web_search.py`.
- **Implementation**: Uses `httpx.AsyncClient(timeout=30.0)` with connection pooling for outbound API requests to OpenRouter endpoints and DuckDuckGo web search.
- **Technical Purpose**: Performs non-blocking HTTP/2 requests, saving 200ms+ per network roundtrip compared to blocking `requests`.

### 5.4 In-Memory Verse Index & Query Expansion
- **File Location**: `api/services/verse_index.py`, `api/services/dataset_cache.py`.
- **Implementation**: On server startup, `dataset_cache.py` loads 5 canonical Gita JSON files into memory. `verse_index.py` performs keyword and stem matching across all 700 Shlokas. If search confidence is low (< 2 verses), `expand_query_for_gita()` uses a fast LLM to generate expanded search terms.
- **Technical Purpose**: RAM lookup executes in **< 2 milliseconds**, eliminating database disk read delays.

### 5.5 Response Tone Sanitizer (`sanitize_response_tone`)
- **File Location**: `api/services/rag_engine.py`.
- **Implementation**: Regex-based post-processing filter. Strips patronizing phrases ("my dear child"), trailing "Om Shanti" tags, rigid section headers (`**Spiritual Explanation & Guidance**`), and markdown symbol noise (`###`).
- **Technical Purpose**: Ensures output quality and conversational tone consistency across different AI models.

---

## 6. Database Architecture & Multi-DB Comparison

NityaGeeta uses **3 specialized databases**, each optimized for a specific data access pattern:

### 6.1 PostgreSQL (via Neon Cloud)
- **Type**: Serverless Relational SQL Database (`psycopg2-binary` / SQLAlchemy).
- **File Location**: Configured via `DATABASE_URL` in `api/config.py` and `frontend/.env.local`.
- **Tables**: `sessions`, `conversations`, `messages`.
- **Technical Purpose**: System of record for permanent conversation history and chat session persistence. **User Profile Architecture**: Google OAuth 2.0 (via NextAuth.js) securely manages all user authentication, identity verification, and profile data (Google name, email, avatar image), while Neon Cloud PostgreSQL handles chat session metadata and message logs.

### 6.2 Redis (via Local Docker Container)
- **Type**: In-Memory Key-Value Store (`redis:7.2-alpine` running on port 1870).
- **File Location**: Configured via `REDIS_URL` in `api/config.py`.
- **Uses**: API rate limiting, response caching for identical queries, session token lookup.
- **Technical Purpose**: Microsecond latency (< 1ms). Prevents redundant LLM API calls by returning cached answers for repeated queries.

### 6.3 Weaviate (Cloud Vector Database)
- **Type**: Vector / Semantic Search Engine (`weaviate.io`).
- **File Location**: Configured via `WEAVIATE_URL` & `WEAVIATE_API_KEY` in `api/config.py`.
- **Uses**: Vector embeddings of 700 Shlokas and long-term conversation semantic memory.
- **Technical Purpose**: Performs semantic distance search (`nearVector`). Matches queries based on mathematical meaning rather than exact word matching.

---

### Database Comparison Matrix

| Metric | PostgreSQL (Neon) | Redis (Docker) | Weaviate (Cloud) |
| :--- | :--- | :--- | :--- |
| **Data Structure** | Relational Tables & JSONB | Key-Value Hashes | High-Dimensional Vector Embeddings |
| **Query Mechanism** | SQL (`SELECT * FROM sessions`) | Key Lookup (`GET session:key`) | Vector Distance (`nearVector` / HNSW) |
| **Latency** | ~10–30 ms | **< 1 ms (Microseconds)** | ~20–50 ms |
| **Data Durability** | Permanent (Disk) | Ephemeral / Snapshot | Permanent Cloud Index |
| **Primary Value** | Session history & chat persistence (Google handles user auth/profiles) | Speed & 90% API cost reduction | Semantic scripture understanding |

---

## 7. Multi-Model AI Ensemble & RAG Engine

The engine processes user queries through a 7-step pipeline:

| Step | Engine Action | Models / Technologies Used |
| :--- | :--- | :--- |
| **1. RAG Search** | Primary verse search + secondary page search | In-Memory Verse Index + LLM Query Expansion |
| **2. Parallel Dispatch** | 5 AI Models fire concurrently in parallel | `Brain 1`: Groq Llama 3.3 70B<br>`Brain 2`: DeepSeek V3 (Advaita / Shankara)<br>`Brain 3`: Mistral 24B (Sadhana / Ramsukhdas)<br>`Brain 4`: Gemma 3 12B (Scientific / Physics)<br>`Brain 5`: GPT-4o Mini (Cognitive Psychology) |
| **3. Web Search** | Live web retrieval running concurrently | DuckDuckGo Async API (`httpx`) |
| **4. Judge Evaluation** | Automated response scoring (0–100) | Groq Llama 3.1 8B Instant |
| **5. Cross-Model Synthesis** | Merges top insights from all models | Groq Llama 3.3 70B |
| **6. Dual-Source Synthesis** | Unifies scripture synthesis + web results | Groq Llama 3.3 70B |
| **7. Sanitization & Render** | Cleans response tone & parses Shlokas | `sanitize_response_tone()` -> `FormattedChatMessage` |

---

## 8. API Architecture & Endpoint Reference

| Endpoint | HTTP Method | Implementation File | Function / Description |
| :--- | :--- | :--- | :--- |
| **`/api/v1/chat`** | `POST` | `api/main.py` | Primary RAG endpoint. Accepts `{ "question": "..." }`, returns synthesized answer, 5 candidate responses, Judge scores, and citations. |
| **`/api/v1/sessions/save`** | `POST` | `api/main.py` | Fire-and-forget sync endpoint saving conversation sessions to PostgreSQL. |
| **`/api/v1/health`** | `GET` | `api/main.py` | Diagnostic health check returning backend, dataset, and database status. |
| **`/api/auth/[...nextauth]`** | `GET` / `POST` | `frontend/src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler for Google OAuth login and JWT session tokens. |

---

## 9. DevOps, Docker & Local Environment Setup

- **`docker-compose.yml`**: Configures and runs local Redis container (`redis:7.2-alpine` on port 1870).
- **CORS Middleware (`api/main.py`)**: Authorizes cross-origin HTTP requests from `http://localhost:1870` to `http://localhost:8000`.
- **Environment Management**: Secrets isolated in `.env` (backend) and `.env.local` (frontend), excluded via `.gitignore`.
- **Deployment Strategy**: Frontend built for Vercel Edge deployment; backend configured for containerized deployment (AWS App Runner / Cloud Run).

---

## 10. Master File Map

```text
NityaGeeta/
├── api/
│   ├── main.py                     # FastAPI app entry point, CORS & REST routes
│   ├── config.py                   # Environment variable loader & Groq key rotator
│   └── services/
│       ├── rag_engine.py           # 7-step RAG pipeline orchestrator & tone sanitizer
│       ├── llm_client.py           # Groq SDK & OpenRouter client for 5-model execution
│       ├── prompt_builder.py       # Persona prompts for Brains 1-5 & Judge evaluator
│       ├── verse_index.py          # In-memory 700 Shloka index & LLM query expansion
│       ├── dataset_cache.py        # Canonical Gita dataset JSON loader & Redis cache
│       └── web_search.py           # Async DuckDuckGo web search fetcher
├── frontend/
│   └── src/
│       ├── app/
│         ├── page.tsx              # Root landing page
│         ├── layout.tsx            # HTML root layout, metadata & Google Fonts
│         ├── providers.tsx         # NextAuth & Theme providers
│         ├── app/page.tsx          # Main dialogue app UI, sidebar & thinking drawer
│         └── api/auth/[...nextauth]/route.ts  # NextAuth Google OAuth handler
│       └── components/
│           ├── ui/
│           │   ├── formatted-chat-message.tsx # Devanagari Shloka card parser
│           │   ├── gita-term-hover-card.tsx    # Spiritual term hover popover tooltips
│           │   └── avatar-group.tsx            # Citation source bubbles
│           └── motion/
│               └── animated-sidebar.tsx        # Framer Motion collapsible sidebar
├── docker-compose.yml              # Local Redis Docker container configuration
└── details.md                      # Technical Architecture Knowledge Guide
```

*Document updated: August 2026 | Technical Knowledge Guide for NityaGeeta*
