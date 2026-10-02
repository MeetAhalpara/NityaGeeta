# Feature Specification: Interactive Chat Page with SSE Streaming & Grounded Vedic Citations

**Feature Branch**: `001-interactive-chat-page`  
**Created**: 2026-09-27  
**Status**: Specified  
**Input**: User description: "Interactive Chat Page with SSE streaming"

---

## Executive Summary
The Interactive Chat Page (`/app`) is the flagship conversational interface for the NityaGeeta Grounded Scriptural Intelligence Platform. It provides seekers, researchers, and enterprise evaluators with real-time, streaming access to 5,034 indexed pages of Vedic scripture and commentaries across 649 shlokas.

This specification details the end-to-end user experience, data contracts, and verification criteria for:
1. Low-latency Server-Sent Events (SSE) token streaming.
2. Grounded scriptural citation badges and verified shloka inspection drawer.
3. Multi-model evaluation transparency (LLM judge scorecards).
4. Robust session continuity and defensive edge-case handling.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Server-Sent Events (SSE) Scriptural Streaming (Priority: P1)

As a spiritual seeker or researcher,  
I want to ask a philosophical question (e.g., *"What is the difference between Sankhya Yoga and Karma Yoga in Chapter 3?"*) and watch the verified scriptural synthesis stream smoothly in real time,  
So that I experience sub-second responsiveness without waiting for the full multi-model consensus pipeline to finish sequentially.

**Why this priority**:
P1 is the foundational interaction loop of the application. Without responsive real-time streaming, users perceive latency as system unresponsiveness, creating poor engagement.

**Independent Test**:
Submit a prompt on `/app` and verify within 850ms that live token stream chunks start rendering progressively inside the chat bubble with active cursor animation, terminating cleanly upon stream completion.

**Acceptance Scenarios**:
1. **Given** a user is on the `/app` page with an idle prompt input,  
   **When** the user types *"How should one control the restless mind according to Chapter 6?"* and presses Enter,  
   **Then** the input field is locked, an optimistic user message appears immediately, and the assistant message displays a typing/streaming indicator within 850ms.
2. **Given** an active SSE stream connection to `/api/v1/chat/stream`,  
   **When** stream tokens arrive over `text/event-stream`,  
   **Then** the UI markdown parser renders the incoming text progressively without layout shift or UI flickering.
3. **Given** the stream completes with a closing `[DONE]` event,  
   **When** the event is received,  
   **Then** the streaming cursor disappears, the final response text is committed to session state, and the input field re-enables for the next query.

---

### User Story 2 - Grounded Scriptural Citations & Shloka Verification Drawer (Priority: P2)

As a student of the Gita,  
I want each philosophical claim in the AI's response to be linked to verified shloka citations (e.g., `BG 2.47`, `BG 6.34`),  
So that I can click on any citation badge to view the original Sanskrit devanagari, IAST romanization, word-for-word English translation, and view the canonical edition PDF page.

**Why this priority**:
Groundedness is NityaGeeta's core differentiator. Pure LLMs hallucinate verses; NityaGeeta eliminates hallucination by grounding generation in verified BM25 scripture corpora.

**Independent Test**:
Inspect an assistant response containing citations. Click on badge `[BG 2.47]`. Verify a slide-over verification drawer opens displaying Chapter 2 Verse 47 Sanskrit text, authentic commentary (Gita Press / Shankaracharya), and a deep-link to page in canonical PDF.

**Acceptance Scenarios**:
1. **Given** an assistant message with verified scriptural sources,  
   **When** the message finishes generating,  
   **Then** a `Verified Scriptural Sources` pill list renders below the text displaying source edition, chapter, and verse badges.
2. **Given** citation pills rendered on the message,  
   **When** the user clicks on a citation badge (e.g., `Gita Press Gorakhpur, p. 142`),  
   **Then** a modal/drawer opens displaying:
     - Exact Sanskrit shloka in Devanagari.
     - Word-by-word grammatical English breakdown.
     - Canonical source commentary excerpt.
     - Direct button to inspect original PDF page via `/api/v1/pdf/{source_id}#page={page}`.
3. **Given** the citation drawer is open,  
   **When** the user presses Escape, clicks the backdrop, or taps `X`,  
   **Then** the drawer smoothly animates closed without resetting chat scroll position.

---

### User Story 3 - Multi-Model Evaluation & Quality Scorecard Transparency (Priority: P3)

As an enterprise technical auditor or ML engineer,  
I want to inspect how the multi-model agent cascade evaluated candidate answers,  
So that I can verify the LLM judge's groundedness scoring, citation accuracy, and winning model selection.

**Why this priority**:
Enterprise stakeholders (such as RBC and IBM evaluators) require explainability and governance over autonomous agent outputs.

**Independent Test**:
Click on the `Model Evaluation` or `Consensus Details` toggle beneath an assistant response. Confirm that a breakdown table expands showing each candidate model (Llama 3, Mixtral, etc.), groundedness score (0.00 to 1.00), citation coverage score, and the judge's justification.

**Acceptance Scenarios**:
1. **Given** a finished query with consensus metadata,  
   **When** the user toggles the `Reasoning & Scorecard` accordion,  
   **Then** the UI expands to show:
     - Winning model badge (e.g., `Llama 3.3 70B Versatile`).
     - Groundedness score (e.g., `94.2%`).
     - Evaluation metrics (Citation precision, Theological clarity, Hallucination delta).
2. **Given** an evaluation scorecard with a groundedness score below `0.70`,  
   **When** rendered in the UI,  
   **Then** the badge displays an amber warning badge stating: *"Moderate confidence: verified against 1 primary scripture edition."*

---

### User Story 4 - Thread Continuity & Session Persistence (Priority: P4)

As a returning user,  
I want my conversational history preserved across sessions,  
So that I can revisit past spiritual inquiries, rename threads, and continue discussions without re-typing context.

**Why this priority**:
Essential for retention and realistic day-to-day usability, though core retrieval works independently on single turns.

**Independent Test**:
Create a chat session, ask two questions, reload the browser tab, and confirm that both turns are restored with complete citations and timestamps.

**Acceptance Scenarios**:
1. **Given** an active chat with multiple exchanges,  
   **When** the user clicks `New Chat` in the sidebar,  
   **Then** the active conversation resets to the welcome state, and the previous thread is saved in the sidebar thread history with an auto-generated title.
2. **Given** multiple saved threads in the sidebar,  
   **When** the user clicks a past thread,  
   **Then** the full message history, citations, and evaluation metadata for that thread load within 200ms.
3. **Given** a user wants to purge history,  
   **When** clicking `Clear All Chats`,  
   **Then** a confirmation prompt is displayed, and upon approval, local history is wiped cleanly.

---

## Edge Cases & Defensive Behaviors

1. **Network Interruption Mid-Stream**:
   - *Behavior*: If the SSE connection drops before `[DONE]`, the client displays an amber retry banner: *"Stream connection interrupted. Reconnecting..."* If reconnection fails after 3 attempts, it triggers a non-streaming fallback request to `POST /api/v1/chat`.
2. **Out-of-Domain or Malicious Inquiries**:
   - *Behavior*: If a user submits out-of-domain prompts (e.g., code generation, financial stock tips, or jailbreak attempts), the grounded guardrail detects zero lexical/semantic overlap with the Gita corpora and responds with a polite scriptural redirection: *"NityaGeeta is dedicated to Vedic scripture and the Bhagavad Gita. Please ask a question related to scriptural wisdom, philosophy, or spiritual practice."*
3. **Oversized Input Payload (DoS Defense)**:
   - *Behavior*: Client-side input validation rejects queries exceeding 2,000 characters with an inline warning before any network call is dispatched.
4. **Backend Circuit Breaker Open (LLM Provider Outage)**:
   - *Behavior*: If primary LLM providers (Groq/OpenRouter) experience an outage, the backend circuit breaker triggers graceful degradation, serving verified pre-cached Gita commentaries and shloka explanations directly from the local BM25 store without crashing.
5. **Slow Mobile Connections**:
   - *Behavior*: Citation drawer and sidebar adapt dynamically into touch-friendly bottom sheets on screens $< 768$px wide.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an SSE streaming endpoint on `/api/v1/chat/stream` delivering `text/event-stream` chunks formatted as `data: {"token": "..."}\n\n`.
- **FR-002**: Frontend MUST implement an SSE consumer using `fetch` + `ReadableStream` (supporting POST) or `EventSource` (supporting GET) that updates message state incrementally.
- **FR-003**: System MUST parse Markdown, Sanskrit transliteration diacritics, and bullet points safely without raw HTML injection (`rehype-sanitize` or strict sanitization).
- **FR-004**: Each response MUST include structured citation metadata array containing `source`, `page`, `chapter`, `verse`, `sanskrit`, and `translation`.
- **FR-005**: UI MUST render citation pill badges that highlight when hovered and open a dedicated scripture detail drawer upon click.
- **FR-006**: Citation drawer MUST provide direct links to the canonical edition PDF viewer via `/api/v1/pdf/{source_id}#page={page}`.
- **FR-007**: System MUST render an expandable `Model Evaluation` scorecard displaying winning model, groundedness score, and judge rationale.
- **FR-008**: Frontend MUST provide a sidebar for thread management: create new chat, list past chats, switch thread, and delete thread.
- **FR-009**: Chat state MUST persist locally in `localStorage` with optional synchronization to backend SQLite/PostgreSQL user sessions.
- **FR-010**: All UI components MUST adhere to the NityaGeeta Design Tokens: Sand background (`#FAF7F2`), Dark background (`#1E1B18`), Terracotta accent (`#C25E38`), and Gold secondary (`#D4AF37`).
- **FR-011**: All interactive buttons, inputs, and drawers MUST have unique, descriptive `id` and `aria-label` attributes for automated accessibility and testing.
- **FR-012**: Client-side input MUST enforce length constraints (min 3 characters, max 2,000 characters) and rate limiting (preventing double-submit while query is in-flight).

### Key Entities

- **`ChatMessage`**: Represents a single turn in a conversation.
  - Attributes: `id` (UUID), `sessionId` (string), `sender` ('user' | 'bot'), `text` (string), `timestamp` (ISO), `citations` (List[CitationItem]), `scorecard` (ScorecardItem), `isStreaming` (boolean).
- **`CitationItem`**: Grounded reference linking AI claim to physical scripture.
  - Attributes: `source` (string), `page` (int), `chapter` (string/int), `verse` (string/int), `sanskrit` (string), `translation` (string), `pdfUrl` (string).
- **`ScorecardItem`**: Multi-model consensus evaluation metrics.
  - Attributes: `winningModel` (string), `groundednessScore` (float 0.0-1.0), `citationScore` (float), `judgeFeedback` (string), `candidateScores` (Dict[string, float]).
- **`ChatSession`**: Thread grouping messages together.
  - Attributes: `id` (string), `title` (string), `createdAt` (ISO), `updatedAt` (ISO), `messageCount` (int).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Time-To-First-Token (TTFT)**: SSE token stream begins rendering in the UI in $< 850$ms under standard network conditions.
- **SC-002**: **Zero Hallucination Guardrail**: 100% of scriptural quotes in the generated response must trace back to an indexed shloka or commentary in the canonical dataset.
- **SC-003**: **Zero Layout Shift**: Cumulative Layout Shift (CLS) during live token streaming must be $< 0.05$.
- **SC-004**: **Mobile Responsiveness**: 100% of chat, citation drawer, and sidebar features must be fully navigable and readable on viewport widths down to 360px.
- **SC-005**: **Automated Verification**: Passes 100% of the 4 Mandatory Quality Verification Pillars:
  1. Automated test suite (`python -m unittest tests/test_qa_suite.py`) passes with 0 regressions.
  2. UI design tokens verified (`#FAF7F2`, `#1E1B18`, `#C25E38`).
  3. Defensive cybersecurity sanitization on all inputs and streams.
  4. Next.js production build (`npm run build`) succeeds with 0 TypeScript/ESLint errors across all routes.

---

## Assumptions & Dependencies

- **Backend Availability**: The FastAPI backend is running and reachable at the configured `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:8000` or `http://localhost:1870`).
- **Dataset Indices**: BM25 lexical indices over the 5 Gita editions (Gorakhpur, Winthrop Sargeant, Sadhak Sanjeevani, Adi Shankaracharya, Vedic Sanatan) are pre-built and cached in memory.
- **Browser Capabilities**: User is accessing via an evergreen browser supporting Fetch Streams and CSS flex/grid layouts.
- **Authentication**: Guest users can engage in ephemeral chat; authenticated users have their threads synchronized across devices.
