# NityaGeeta (नित्यगीता)

> **"Nitya" (Sanskrit: नित्य)** translates to *eternal* or *perpetual*.

**NityaGeeta** is an AI-powered conversational and spiritual intelligence platform designed to assist users in querying and integrating the teachings of the *Srimad Bhagavad Gita*. Utilizing Retrieval-Augmented Generation (RAG) and authenticated classical commentaries, the system delivers philosophically accurate guidance.

---

## Key Features

* **Grounded Philosophical RAG**: Answers are anchored in authenticated classical commentaries (Adi Shankaracharya, Gita Press Sadhaka-Sanjivani by Swami Ramsukhdas, Winthrop Sargeant).
* **Conversational Interface**: Natural language querying for philosophical concepts regarding duty, action, decision-making, and self-realization.
* **Complete 1,296-Page Gita Press Dataset**: Fully translated, verified, and structured English edition of Gita Press Gorakhpur Sadhaka-Sanjivani.
* **Hybrid Search & Caching**: Vector search via Weaviate Cloud combined with Redis session caching and Neon PostgreSQL relational storage.
* **Anti-Hallucination Guardrails**: Validation pipelines prevent generic AI speculation and enforce fidelity to source texts.

---

## Ground Truth Knowledge Base

NityaGeeta relies on a curated library of historical and academic editions:

1. **Srimad Bhagavad Gita — Gita Press Gorakhpur (Sadhaka-Sanjivani)**: Complete 1,296-page commentary by Swami Ramsukhdas (Hindi & English translations).
2. **Bhagavad Gita with Commentary of Swami Shankaracharya**: Classical Advaita Vedanta commentary.
3. **The Bhagavad Gita by Winthrop Sargeant**: Word-for-word grammatical analysis and English translation.

---

## Project Directory Structure

```
NityaGeeta/
│
├── data/
│   └── output/
│       └── gita_editions/
│           ├── gita_press_translated.json   # Consolidated 1,296-page English dataset
│           └── Srimad Bhagavad Gita Press Gorakhpur.json # Source OCR dataset
│
├── scripts/
│   ├── data_fixes/                          # Translation & quality repair scripts
│   │   ├── translate_page_67.py             # Page translation & Groq API tool
│   │   └── page_*.json                      # Individual page translation records
│   └── utilities/                           # Data processing scripts
│
├── docs/                                    # Documentation & audit logs
├── .env.example                             # Environment variable template
├── .gitignore
├── README.md
└── requirements.txt                         # Python dependencies
```

---

## Dataset Quality & Completion

| Metric | Status |
| :--- | :--- |
| **Total Pages** | `1,296 / 1,296` (100% complete) |
| **Sequence Integrity** | Pages 1 to 1,296 in exact order |
| **Clean Translations** | **1,291 / 1,296 (99.61%)** |
| **Fallback Text Elimination** | 100% Clean (0 placeholder errors) |
| **Thinking Tag Cleanup** | 100% Clean (0 `<think>` tags) |

---

## Getting Started

### 1. Prerequisites
* Python 3.10+
* Groq API Key
* Neon PostgreSQL & Weaviate Cloud credentials

### 2. Setup Environment
```bash
# Clone repository
git clone https://github.com/MeetAhalpara/NityaGeeta.git
cd NityaGeeta

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY1=gsk_...
GROQ_API_KEY2=gsk_...
DATABASE_URL=postgresql://user:pass@host/db
WEAVIATE_URL=https://instance.cloud.weaviate.io
WEAVIATE_API_KEY=key
```

---

## License & Acknowledgments

* **Text Rights**: Source Sanskrit and Hindi texts belong to Gita Press Gorakhpur and respective historical authors.
* **Project License**: MIT License.
