# NityaGeeta Security Threat Matrix: Dual-Use Risks & Unintended Attack Surfaces

> **Core Concept**: In advanced cybersecurity engineering, every security control or countermeasure introduced can itself become an attack surface, a secondary vulnerability, or a denial-of-service vector if misconfigured, unconstrained, or exploited. This document analyzes every security measure implemented in NityaGeeta, where it can potentially become a threat, and how it is fortified.

---

## 1. Executive Summary of Added Securities

| Security Countermeasure Added | Primary Defense Purpose | Potential Threat / Risk if Exploited or Misconfigured | Vulnerable Location / Where Threat Occurs | Engineering Fortification Applied in NityaGeeta |
| :--- | :--- | :--- | :--- | :--- |
| **1. In-Memory Sliding-Window Rate Limiter** (`middleware.ts`) | Mitigates credential stuffing, automated bots, and API denial-of-service. | **Legitimate User Starvation & Memory Exhaustion**: Shared NAT IP blocking (e.g. campus Wi-Fi) and RAM exhaustion from spoofed `X-Forwarded-For` IPs. | Frontend Edge / Middleware (`/api/*`) | Periodic 5-minute eviction interval, route-tiered quotas (20 auth, 180 PDF), client IP fallback. |
| **2. Bcrypt Adaptive Password Hashing** (`api/main.py`) | Protects stored credentials against offline rainbow table and dictionary attacks. | **CPU Starvation Denial of Service**: Bcrypt is intentionally CPU-expensive; huge passwords (e.g. 100,000 chars) lock CPU cores. | Backend Auth Endpoints (`/api/v1/auth/login`, `/register`) | Enforced `max_length=128` in Pydantic models, rejecting oversized passwords *before* hashing runs. |
| **3. PDF Reverse Proxy & Range Streaming** (`pdf-proxy/route.ts`) | Isolates Google Cloud Storage and enables seamless chunk streaming. | **Server-Side Request Forgery (SSRF) & Memory Exhaustion**: Internal network scanning (`169.254.169.254`) and RAM bloat from uncapped chunk caching. | Next.js Server Route Handler (`/api/pdf-proxy`) | Strict `https:` enforcement, exact hostname whitelist regex, private RFC1918 blocking, and 64 MB bounded LRU chunk cache. |
| **4. Strict Content Security Policy (CSP)** (`next.config.mjs`) | Neutralizes Cross-Site Scripting (XSS), data injection, and unauthorized frame embedding. | **Self-Inflicted Functional Denial of Service**: Over-restrictive CSP blocks legitimate PDF.js web workers or Google Fonts, breaking UI. | User Browser Runtime (All pages) | Explicitly safelisted `worker-src 'self' blob: https://cdnjs.cloudflare.com`, Google Fonts, and GCS image origins. |
| **5. AI Prompt Injection Sanitizer** (`prompt_builder.py`) | Neutralizes jailbreaks (DAN, "ignore previous instructions") and boundary breakouts. | **Over-Sanitization False Positives**: Stripping legitimate spiritual inquiries that mention "rules", "ignore", or ancient epic warfare contexts. | Multi-Model RAG Ensemble Prompts | Regex targeting command syntax phrases rather than single words, sealing queries inside rigid `<user_query>` XML boundaries. |
| **6. Pydantic Input Length Bounds** (`api/main.py`) | Mitigates memory allocation bombs and ReDoS (Regular Expression DoS). | **Valid Theological Inquiry Rejection**: Legitimate users pasting long philosophical Gita contexts being rejected with HTTP 422. | FastAPI Serialization Layer (`ChatRequest`, `SearchRequest`) | Generous bounds tailored to usage: 2,000 chars for Chat (~400 words), 200 chars for Search, 254 chars for Email. |
| **7. UUID Format Enforcement** (`api/main.py`) | Prevents SQL injection and database type-casting crashes (`22P02`). | **State Desynchronization / Client 400 Errors**: If client generates non-standard session IDs, user loses conversation persistence. | Session Endpoints (`/api/v1/sessions/*`) | Client generates standard RFC4122 v4 UUIDs, with fallback local storage persistence if server rejects. |
| **8. Environment Secrets Vault** (`.env`) | Protects LLM API keys, database URLs, and NextAuth JWT secrets. | **The TSA Master Key Leak Threat**: Accidental leakage in git commits, client bundles, or error logs compromises the entire platform. | Source Code Management & Client Bundles | `.env` strictly gitignored, zero client-exposed secrets (`NEXT_PUBLIC_` used only for public URLs), error sanitization in production. |

---

## 2. Deep Dive: "How Added Securities Can Become Threats Where"

### Threat Vector 1: The Rate Limiter Starvation & Spoofing Paradox
- **Where the Threat Occurs**: `frontend/src/middleware.ts` targeting `/api/auth/*` and `/api/*`.
- **The Dual-Use Threat**:
  1. *Campus / Corporate NAT Collisions*: When hundreds of users access NityaGeeta from the same university campus, hospital, or enterprise corporate network, all outbound requests share a single public IPv4 address. An attacker on that network intentionally failing 20 login attempts triggers an IP ban that denies service to every legitimate user on that network.
  2. *Memory Exhaustion via Header Spoofing*: If an attacker generates 1,000,000 requests with randomized `X-Forwarded-For: <random-ip>` headers, an in-memory `Map` that tracks IPs will consume hundreds of megabytes of heap memory, triggering an Out-Of-Memory (OOM) crash in the Node.js runtime.
- **Fortification Implemented**:
  - Memory-safe bounded tracker: The `ipLimiters` Map runs an automated background cleanup every 5 minutes, purging expired buckets.
  - Generous non-auth limits: General API routes allow 60 req/min, and the PDF proxy allows 180 req/min to accommodate concurrent byte-range chunk streaming.
  - Production Recommendation: In distributed multi-region deployments, migrate the in-memory Map to an external Redis token bucket with automatic TTL eviction.

---

### Threat Vector 2: The Bcrypt CPU Starvation Hazard
- **Where the Threat Occurs**: `api/main.py` at `/api/v1/auth/login` and `/api/v1/auth/register`.
- **The Dual-Use Threat**:
  - Bcrypt was deliberately engineered to be computationally expensive (slow) to thwart offline GPU cracking. The algorithm performs key stretching over $2^{\text{cost}}$ rounds.
  - If the application allows unconstrained password lengths, an adversary can submit a POST request containing a 500,000-character password string.
  - When the Python thread executes `bcrypt.hash(password)` or `bcrypt.verify(password, hash)`, the CPU core spikes to 100% utilization for several seconds or minutes.
  - Sending just 10 concurrent requests with giant passwords completely starves the FastAPI ASGI event loop, causing total API outage (Denial of Service).
- **Fortification Implemented**:
  - We enforced `password: str = Field(..., max_length=128)` in `LoginRequest`, `RegisterRequest`, and `GoogleSetupRequest`.
  - Pydantic validates and rejects oversized passwords with HTTP 422 *before* the request handler passes the string to `bcrypt`, neutralizing the CPU exhaustion attack at zero cost.

---

### Threat Vector 3: The PDF Reverse Proxy SSRF & Cache Poisoning Hazard
- **Where the Threat Occurs**: `frontend/src/app/api/pdf-proxy/route.ts` via the `url` query parameter.
- **The Dual-Use Threat**:
  1. *Server-Side Request Forgery (SSRF)*: A reverse proxy fetches resources on behalf of clients. If URL validation relies on loose substring checks (e.g. `url.includes("storage.googleapis.com")`), an attacker can supply `https://storage.googleapis.com.attacker-domain.com` or `http://169.254.169.254` (cloud metadata). The server acts as a confused deputy, leaking instance identity tokens or internal network ports.
  2. *Unvalidated HEAD Probing*: If `GET` is protected but `HEAD` is unprotected, attackers use `HEAD` requests as a stealth port scanner against internal subnets.
  3. *In-Memory Cache Bombing*: The proxy caches chunks in RAM for speed. If an attacker floods unique random byte-range parameters (`Range: bytes=0-10`, `Range: bytes=1-11`, etc.), uncapped caching will quickly exhaust server RAM.
- **Fortification Implemented**:
  - Unified `validateSafePdfUrl()` function applied to **both** `GET` and `HEAD` handlers.
  - Strictly requires `https:` protocol (blocks `http:`, `file:`, `ftp:`, `gopher:`).
  - Explicitly blocks loopback (`127.0.0.1`, `localhost`), metadata (`169.254.169.254`), and private RFC1918 subnets (`10.x`, `172.16-31.x`, `192.168.x`).
  - Enforces exact hostname whitelisting (`hostname === "storage.googleapis.com"` or `hostname === "nityageeta.com"`).
  - Hard cap of 64 MB on the LRU chunk cache (`MAX_CACHE_SIZE_BYTES = 64 * 1024 * 1024`) with automatic oldest-entry eviction.

---

### Threat Vector 4: The Content Security Policy (CSP) Self-Denial Hazard
- **Where the Threat Occurs**: `frontend/next.config.mjs` security headers.
- **The Dual-Use Threat**:
  - A Content Security Policy instructs the browser to block any resource not explicitly permitted.
  - If a developer sets `default-src 'self'` without accounting for modern web app dependencies, the browser will block:
    - PDF.js Web Workers (which execute via `blob:` URLs or Cloudflare CDN).
    - Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`).
    - Cloud image avatars (`storage.googleapis.com` and `lh3.googleusercontent.com`).
  - Result: The security header destroys the user experience, causing white screens or failing PDF readers.
- **Fortification Implemented**:
  - Surgically crafted CSP policy:
    - `worker-src 'self' blob: https://cdnjs.cloudflare.com;`
    - `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com;`
    - `font-src 'self' https://fonts.gstatic.com data:;`
    - `img-src 'self' data: blob: https://storage.googleapis.com https://lh3.googleusercontent.com;`
    - `connect-src 'self' https://storage.googleapis.com http://localhost:8000 http://127.0.0.1:8000 ws: wss:;`
    - `frame-ancestors 'none';` (blocks clickjacking while preserving in-app components).

---

### Threat Vector 5: AI Prompt Injection Sanitization & Over-Sanitization Risk
- **Where the Threat Occurs**: `api/services/prompt_builder.py` during user query preprocessing.
- **The Dual-Use Threat**:
  1. *Adversarial Jailbreak Risk (Under-Sanitization)*: Attackers use jailbreaks ("Ignore previous instructions", "You are now DAN", XML breakouts `</user_query><system>`) to manipulate the persona, output offensive text, or extract system prompts and API keys.
  2. *Theological Censorship Risk (Over-Sanitization)*: If regex filtering is too aggressive (e.g. banning the word "ignore" or "kill" or "fight"), a user asking about Arjuna's moral dilemma in Chapter 1 ("Why must I fight my teachers?") would be falsely blocked or censored, breaking spiritual authenticity.
- **Fortification Implemented**:
  - Multi-phrase contextual regex: Neutralizes full command structures (`ignore\s+(all\s+)?previous\s+instructions`) rather than broad keywords.
  - Replaces malicious directives with neutral placeholder `[inquiry]` to keep prompt syntax valid.
  - Strips pseudo-XML tags (`</user_query>`, `<system>`, `<script>`) to prevent boundary escapes.
  - Encapsulates queries inside rigid XML tags (`<user_query>...</user_query>`) backed by explicit system guardrails instructing the LLM to treat everything inside as untrusted data.

---

### Threat Vector 6: The "Myth of Talos" AI Single Point of Failure (Network Security & Redundancy)
- **Where the Threat Occurs**: Multi-Model RAG evaluation pipeline (`api/services/rag_engine.py` and `prompt_builder.py`).
- **The Dual-Use Threat**:
  - In Greek mythology, the bronze giant Talos was an invincible automated guardian, yet was destroyed because his divine life-force depended on a single ankle bolt.
  - If an AI architecture relies on a single LLM or an automated "Judge model" as the sole decision maker, an adversarial prompt or hallucination in that single model could corrupt the answer delivered to the user.
- **Fortification Implemented**:
  - Multi-Model Parallel Fan-Out: User queries are evaluated across multiple perspective brains (Advaita, Sadhak Sanjeevani, Scientific, Psychological, BOSS) simultaneously.
  - Ground-Truth Grounding Gate: Shlokas are extracted strictly from pre-indexed canonical datasets (Gita Press, Winthrop Sargeant) rather than generated from model memory.
  - Fail-safe Fallback: If model synthesis fails or scores low, the system falls back directly to the primary Gita Press shloka and authentic translation.

---

### Threat Vector 7: Access Control & The "TSA Master Key" Leak (Need-to-Know Principle)
- **Where the Threat Occurs**: `.env` configuration, GitHub repositories, and client-side JavaScript bundles.
- **The Dual-Use Threat**:
  - In 2014, the TSA introduced master luggage keys. In 2015, a high-resolution photo of the keys was published in the Washington Post, allowing hackers to 3D-print copies worldwide within hours.
  - If API keys (Gemini, Groq, Neon DB, NextAuth Secret) are committed to version control, exposed via `NEXT_PUBLIC_` variables, or logged in client browser consoles, all cryptographic protections are instantly rendered useless.
- **Fortification Implemented**:
  - Strict `.gitignore` enforcement for all `.env*` files and service account JSONs.
  - Client bundle isolation: Only public metadata is prefixed with `NEXT_PUBLIC_`; database credentials and AI API keys exist strictly on the backend.
  - Production error masking: Internal exception tracebacks are suppressed in HTTP responses and logged securely on the server.

---

### Threat Vector 8: Security Hardening & The Equifax Patch Failure (Vulnerability Patching & Segmentation)
- **Where the Threat Occurs**: Third-party framework dependencies (`node_modules`, Python `site-packages`).
- **The Dual-Use Threat**:
  - In 2017, Equifax suffered a 147-million-record breach due to an unpatched Apache Struts vulnerability, insufficient network segmentation, and an expired inspection certificate, resulting in $575M+ in fines.
  - Building on modern frameworks (Next.js, FastAPI, Pydantic) provides high speed, but if upstream vulnerabilities are neglected, attackers can exploit known CVEs.
- **Fortification Implemented**:
  - Automated dependency audit requirements (`npm audit` and `pip-audit`).
  - Network segmentation: Frontend Next.js and backend FastAPI communicate over isolated internal networks.
  - Enforced HTTPS with 2-year HSTS preload (`max-age=63072000; includeSubDomains; preload`).
