# Tasks: Interactive Chat Page with SSE Streaming & Grounded Vedic Citations

**Input**: Design documents from `specs/001-interactive-chat-page/`  
**Prerequisites**: [specs/001-interactive-chat-page/plan.md](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/specs/001-interactive-chat-page/plan.md) and [specs/001-interactive-chat-page/spec.md](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/specs/001-interactive-chat-page/spec.md)

---

## Task Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel
- **[Story]**: US1 (Streaming), US2 (Citations), US3 (Evaluation Scorecard), US4 (Threads & Sessions)

---

## Phase 1: Setup & Foundational Infrastructure

- [x] **T001** [P] [Foundation] Audit and verify FastAPI backend SSE streaming endpoints (`POST /api/v1/chat/stream` and `GET /api/v1/chat/stream`) in `api/main.py`.
- [x] **T002** [P] [Foundation] Validate frontend environment routes and proxy endpoints (`frontend/src/app/api/chat/route.ts` and `frontend/src/app/app/page.tsx`).
- [x] **T003** [Foundation] Ensure design system tokens (`#FAF7F2`, `#1E1B18`, `#C25E38`, `#D4AF37`) are active in `frontend/src/app/globals.css`.

---

## Phase 2: User Story 1 (P1) — Real-Time SSE Scriptural Streaming

- [x] **T004** [US1] Implement resilient `fetch` + `ReadableStream` reader in `frontend/src/app/app/page.tsx` for real-time token accumulation.
- [x] **T005** [US1] Add dynamic streaming cursor pulse animation and automatic auto-scroll to bottom of chat viewport.
- [x] **T006** [US1] Integrate defensive client-side input bounds checking (min 3 chars, max 2,000 chars) with visual character counter.
- [x] **T007** [US1] Handle mid-stream connection failures with retry banner and fallback to non-streaming `POST /api/v1/chat`.

---

## Phase 3: User Story 2 (P2) — Grounded Citations & Shloka Verification Drawer

- [x] **T008** [US2] Parse structured citation arrays (`source`, `page`, `chapter`, `verse`, `sanskrit`, `translation`) from metadata SSE chunk.
- [x] **T009** [US2] Render interactive citation pill badges below assistant responses with hover effects.
- [x] **T010** [US2] Build the slide-over `CitationInspectionDrawer` with Devanagari verse display, grammatical breakdown, and commentary excerpt.
- [x] **T011** [US2] Implement direct canonical PDF page viewer integration via `/api/v1/pdf/{source_id}#page={page}`.

---

## Phase 4: User Story 3 (P3) — Multi-Model Evaluation & Scorecard Transparency

- [x] **T012** [US3] Extract consensus evaluation payload (`winning_model`, `groundedness_score`, `citation_score`, `judge_feedback`) on stream completion.
- [x] **T013** [US3] Build expandable `ReasoningText` and `Scorecard` accordion component showing model scores and evaluation justification.
- [x] **T014** [US3] Add confidence badge styling (Green for $\ge 85\%$, Amber for $< 70\%$) with clear explanation of scripture cross-referencing.

---

## Phase 5: User Story 4 (P4) — Thread Continuity & Session Persistence

- [x] **T015** [US4] Implement thread management in `AnimatedSidebar`: New Chat button, active thread indicator, and auto-generated thread titles.
- [x] **T016** [US4] Persist conversation histories to `localStorage` with seamless rehydration upon browser reload.
- [x] **T017** [US4] Provide thread deletion and full conversation reset actions with confirmation modal.

---

## Phase 6: Mandatory 4-Pillar Quality Protocol

- [x] **T018** [QA/QT] Run backend automated test suite (`.venv\Scripts\python.exe -m unittest tests/test_qa_suite.py` and `pytest`).
- [x] **T019** [UI Checking] Verify Framer Motion animations, color tokens, and responsive layout on mobile viewport.
- [x] **T020** [CyberSecurity] Audit input sanitization, rate-limiting locks, and SQL/XSS prevention on chat API.
- [x] **T021** [FrontEnd Analyser] Execute `npm run build` in `frontend/` to confirm 0 compilation errors across all 21 routes.
