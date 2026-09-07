# Contributing to NityaGeeta (नित्यगीता)

Thank you for your interest in contributing to **NityaGeeta**! 

NityaGeeta is dedicated to preserving, organizing, and synthesizing the timeless wisdom of the **Bhagavad Gita** and classical Vedic commentaries using verifiable, hallucination-free AI architectures. Every contribution—whether correcting an OCR typo, submitting traditional Bhashyas, fixing an interface glitch, or refining semantic dilemma algorithms—directly enriches this sacred mission.

---

## Ways to Contribute

### 1. Sanskrit Verse & OCR Corrections
Accuracy is the sacred core of NityaGeeta. If you discover a typographical error in a Devanagari verse, IAST transliteration, word-for-word split, or Hindi/English translation:
* Open an issue or PR citing the **Chapter and Verse number** (e.g., `BG 2.47`).
* Provide the verified reference from physical printed editions (preferably **Gita Press Gorakhpur** or classical Acharya publications).
* Mention the exact text file in `frontend/src/data/` or `data/` to be corrected.

### 2. Archival Commentary & Bhashya Submissions
We warmly welcome contributions of verified classical commentaries across all authentic traditions:
* **Advaita Vedanta** (Adi Shankaracharya, Anandagiri)
* **Vishishtadvaita** (Ramanujacharya, Vedanta Desika)
* **Dvaita** (Madhvacharya, Jayatirtha)
* **Shuddhadvaita / Achintya Bhedabheda** (Vallabhacharya, Baladeva Vidyabhushana)
* **Modern Sanjivani** (Swami Ramsukhdas)

### 3. Modern Life Dilemma Scenarios
Help expand the library of real-world dilemmas in `frontend/src/data/gitaDilemmas.ts`:
* Propose modern psychological, ethical, or career situations (burnout, grief, imposter syndrome, ethical whistleblowing).
* Map the conflict directly to its foundational Bhagavad Gita verse citation.
* Provide practical, grounded psychological reframing rooted in the shloka.

### 4. Software Engineering & AI Enhancements
* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion GPU animations, and responsive accessibility.
* **Backend**: FastAPI (Python 3.12), async consensus evaluation, Weaviate vector retrieval, PostgreSQL session management, and Redis caching.
* **Cybersecurity & AppSec**: SSRF validation, input sanitization, rate-limiting, and VAPT resilience testing.

---

## Local Development Setup

### Prerequisites
* **Node.js**: v20.x or higher
* **Python**: v3.11 or v3.12
* **Git**: Latest version

### 1. Clone the Repository
```bash
git clone https://github.com/MeetAhalpara/NityaGeeta.git
cd NityaGeeta
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client will be running at `http://localhost:1870`.

### 3. Backend Setup
```bash
# In the repository root:
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```
FastAPI Swagger docs will be available at `http://localhost:8000/docs`.

---

## Running Quality Assurance (QA) & Tests

Before submitting a Pull Request, please ensure all automated checks pass cleanly:

```bash
# 1. Frontend TypeScript Compilation
cd frontend
npx tsc --noEmit

# 2. Page & Citations Integrity Suite
python QA/test_pages_integrity.py

# 3. Dilemmas & Search Verification Suite
python QA/test_contact_page_suite.py
python QA/test_new_dilemma_search.py
```

---

## Pull Request Guidelines

1. **Fork & Branch**: Create a descriptive feature branch (`git checkout -b feature/verse-2-22-correction` or `git checkout -b fix/dropdown-mobile-alignment`).
2. **Atomic Commits**: Write clear, concise commit messages following standard conventions:
   * `feat: add Chapter 18 Sharanagati dilemma scenario`
   * `fix: correct Devanagari anusvara in verse 6.35`
   * `docs: update Gita Press citation URLs`
3. **Verify Locally**: Make sure the build and all tests pass with zero errors.
4. **Submit PR**: Open your Pull Request against the `main` branch with a clear summary of changes and reference sources.

---

## Questions & Community

Have questions or want to discuss an idea before writing code?
* Open a [GitHub Discussion](https://github.com/MeetAhalpara/NityaGeeta/discussions)
* Reach out via our [Contact Portal](https://nityageeta.org/contact) or email [contact@nityageeta.org](mailto:contact@nityageeta.org)

*Hari Om Tat Sat.*
