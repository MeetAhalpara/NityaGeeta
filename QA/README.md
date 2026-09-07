# Software Testing & Quality Assurance (QA) Framework
## NityaGeeta — Universal Bhagavad Gita AI Platform

---

### 1. Overview & Purpose
This directory contains the **Software Testing and Quality Assurance (QA)** assets, specifications, and test suites for **NityaGeeta**. 

The primary objective of this QA framework is to guarantee:
1. **Manuscript Fidelity & Scriptural Ground Truth**: Zero distortion, sectarian bias, or mistranslation across the 700 canonical Sanskrit verses and canonical commentaries (Gita Press Sadhaka-Sanjivani, SUNY Press Winthrop Sargeant, Adi Shankaracharya Bhashya).
2. **Pedagogical Epistemology Compliance**: Adherence to the foundational principle that Hinduism and the Bhagavad Gita represent a living tradition (*Itihasa* combining historical memory and sacred narratives) rather than arbitrary fiction or mythology.
3. **Application Reliability & Zero Regressions**: End-to-end frontend type safety, fast page load speeds, seamless dark/light theme contrast, responsive mobile layouts, and resilient search indexing.
4. **Interactive UX Consistency**: Apple-grade visual polish, symmetrical search pills with real-time match counters, and accessible navigation.

---

### 2. QA Directory Structure
```text
qa/
├── README.md                  # Master QA Architecture, Standards & Testing Policy
├── test_plan.md               # IEEE 829 Software Test Plan (Scope, Criteria, Milestones)
├── test_cases.md              # Exhaustive Manual & Automated Test Case Matrix
├── test_api_endpoints.py      # Functional REST API Contract & CRUD Suite (18 Tests)
├── test_sources_resilience.py # Multi-Scenario Sources QA Test Suite (17 Tests)
├── test_dilemmas_suite.py     # Multi-Scenario Dilemmas QA Test Suite (16 Tests)
├── test_search_alignment_loop.py # Contextual Search Alignment Loop (16 Profiles)
├── automated_tests.py         # Automated QA Suite for Canonical Data & Frontend Code
├── API_TEST_AUDIT.md          # Comprehensive Audit Report for REST API & Contracts
├── SOURCES_QA_AUDIT.md        # Comprehensive Audit Report for /sources
├── DILEMMAS_QA_AUDIT.md       # Comprehensive Audit Report for /dilemmas
├── SEARCH_ALIGNMENT_QA.md     # Comprehensive Search Alignment Specifications
└── run_qa_tests.ps1           # One-Click Automated QA Runner Script (PowerShell)
```

---

### 3. Testing Levels & Methodology

| Test Level | Scope & Target | Tooling / Framework |
| :--- | :--- | :--- |
| **Functional REST API & CRUD** | Endpoints (`/health`, `/search`, `/pages`, `/pdf`, `/auth`, `/sessions`, `/chat`) | FastAPI `TestClient`, HTTPX, Python (`qa/test_api_endpoints.py`) |
| **Data & Corpus Integrity** | 700 Verses, 18 Chapters, OCR datasets, Sanskrit transliteration | Python automated tests (`qa/automated_tests.py`) |
| **Multi-Scenario Resilience** | Happy, Bad, Raining, Worse conditions across `/sources` & `/dilemmas` | Python test suites (`test_sources_resilience.py`, `test_dilemmas_suite.py`) |
| **Static Analysis & Types** | Strict TypeScript compilation, Next.js build verification | `npx tsc --noEmit`, ESLint |
| **Functional & UI/UX** | Sources & Manuscripts, Life Dilemmas Engine, Search pills, Drawer tables | Browser subagent, Playwright, Manual Test Matrix |
| **Visual & Accessibility** | Dark Mode contrast (`#1C1917`), Apple-style pills, WCAG 2.1 AA | Lighthouse, Chrome DevTools, Automated CSS checks |
| **Canonical RAG Verification** | Neutral non-sectarian purports, Sanskrit word-by-word citations | Python validation scripts, ground-truth logs |

---

### 4. Running the QA Test Suite

To execute the automated QA test suite on Windows PowerShell:
```powershell
# Run the complete 5-stage automated suite
.\qa\run_qa_tests.ps1
```
Or run individual targeted test suites:
```powershell
# Functional REST API Contract & CRUD Suite (18 Tests)
py qa/test_api_endpoints.py

# Sources Multi-Scenario Resilience Audit (17 Tests)
py qa/test_sources_resilience.py

# Dilemmas Multi-Scenario Resilience Audit (16 Tests)
py qa/test_dilemmas_suite.py
```

All test outcomes, verification logs, and coverage reports are automatically recorded in `qa/reports/`.

