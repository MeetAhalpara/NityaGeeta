# Master Software Test Plan (STQA Plan)
## Project: NityaGeeta Universal Bhagavad Gita Intelligence Platform
**Document Version:** 1.0.0  
**Status:** Approved & Active  
**Author:** QA Engineering & Academic Architecture Team  

---

## 1. Introduction
The purpose of this Master Software Test Plan is to define the testing strategy, scope, environment, deliverables, and pass/fail criteria for the **NityaGeeta** platform.

NityaGeeta integrates canonical classical commentaries, multi-token semantic retrieval, and modern life dilemma coaching. High reliability, manuscript fidelity, and flawless UI/UX responsiveness are mission-critical.

---

## 2. Test Items & Scope

### 2.1 In-Scope Features
1. **Sources & Manuscripts (`/sources`)**:
   - 4 Tiered Canonical Commentaries: Sadhaka-Sanjivani (pp. 1–1296), Winthrop Sargeant SUNY (pp. 35–739), Adi Shankaracharya Bhashya (pp. 1–554), Gita Press Original (pp. 1–400).
   - All 18 chapters indexing and page numbers.
   - Initial collapsed state on page load (`expandedSourceId === null`).
   - Veducation Series: B.O.S.S (10 chapters), Vedic Dincharya (Beta disclaimer), Brahmacharya (Beta disclaimer), and 5-in-1 Master Bundle.
   - Clean subtitles (omission of `(Veducation.world)`).
   - In-app PDF manuscript reader integration.
2. **Life Dilemmas Engine (`/dilemmas`)**:
   - Universal search with symmetrical match count pill (`N matches | ✕`).
   - Category filtering (All, Work, Ethics, Mental, Relationships, Existential).
   - Chapter filtering buttons & URL deep-linking (`?chapter=X`).
   - 18 Chapters Canonical Directory table with clean chapter numbers (`1`, `2`, `3` ... `18`).
   - 1-click AI dialogue navigation.
3. **Search & Discovery Engine**:
   - Multi-token semantic search across Sanskrit, transliteration, and English themes.
   - Empty state UI with interactive suggestions (`karma`, `cosmic time`, `Chapter 2`) and topic chips.
4. **Theme & Accessibility**:
   - Light/Dark mode transitions.
   - Dark theme contrast (`#1C1917` warm dark canvas with terracotta accents).
   - Mobile viewport responsiveness down to 360px.

### 2.2 Out-of-Scope Features
- External third-party payment gateways for merchant bookstore checkout.
- Non-canonical speculative internet translations.

---

## 3. Test Approach & Strategy

### 3.1 Static Code Analysis & Type Safety
- **TypeScript**: `npx tsc --noEmit` executed on every commit. Zero compiler errors permitted.
- **Next.js Linting**: Static validation of React hooks, dependency arrays, and hydration safety.

### 3.2 Automated Corpus & Integrity Testing
- Python test suite verifying that all 700 verses across 18 chapters exist, have non-empty text, correct chapter bounds, and verified Sanskrit transliteration.

### 3.3 Visual & UI/UX Regression Testing
- Headless browser verification via automated subagents for pill alignment, hover translation (`hover:-translate-y-0.5`), modal locks, and responsive layouts.

---

## 4. Entry & Exit Criteria

### Entry Criteria
- Source code builds without fatal runtime syntax errors.
- Active Node.js v18+ and Python 3.10+ environments configured.
- Static dataset files located in `frontend/src/data/`.

### Exit Criteria (Release Readiness)
- 100% of P1 (Blocker) and P2 (Critical) test cases must pass.
- 0 TypeScript compilation errors (`tsc --noEmit`).
- No UI layout overlap or broken pill styling in search bars.
- Epistemology verification confirmed: Living Tradition vs. Mythology grounded.

---

## 5. Defect Severity & Priority Classification

| Severity Level | Definition | SLA / Action |
| :--- | :--- | :--- |
| **P1 - Blocker** | App crash, broken verse citations, incorrect Sanskrit shloka text, runtime TypeError. | Immediate fix; blocks release. |
| **P2 - Critical** | Broken search filtering, search pill overlap, incorrect chapter mapping. | Fix within 24 hours. |
| **P3 - Moderate** | Styling alignment issues, missing hover state, tooltip cutoff on mobile. | Scheduled for next sprint. |
| **P4 - Minor** | Minor typo in commentary notes, slight padding inconsistency. | Backlog task. |

---

## 6. Test Deliverables
1. `qa/test_cases.md` — Complete QA Execution Matrix.
2. `qa/automated_tests.py` — Automated Python verification script.
3. `qa/run_qa_tests.ps1` — Automated test runner script.
4. Execution reports and logs recorded in `qa/reports/`.
