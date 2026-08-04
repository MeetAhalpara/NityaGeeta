# Data Engineering & Automation Scripts (`/scripts`)

The `scripts/` directory contains automated Python data pipelines, OCR extraction tools, translation repair scripts, and utility helpers used to ingest, clean, and verify canonical scripture datasets for NityaGeeta.

---

## Directory Architecture & Submodule Breakdown

```
scripts/
├── check_pdf_type.py              # PDF text layer & encoding analyzer
├── gita_parsers/                  # OCR extraction & verification for Gita editions
├── veducation_parsers/            # OCR extraction for Veducation handbooks
├── data_fixes/                    # Batch translation & page injection tools
└── utils/                         # API model listing & diagnostic utilities
```

---

## Detailed Submodule Specifications

### 1. `scripts/gita_parsers/` — Canonical Gita Ingestion & Verification
* **Role**: Extracts and parses raw OCR text files into structured JSON datasets for canonical Gita editions.
* **Key Scripts**:
  * `extract_gita_press_ocr.py`: Parses raw text scans of Gita Press Gorakhpur *Sadhaka-Sanjivani* into page-indexed JSON objects.
  * `extract_sadhak_sanjeevani_ocr.py`: Extracted verse-level English commentary records.
  * `extract_sargeant_ocr.py`: Processes Winthrop Sargeant's word-for-word grammatical dictionary.
  * `extract_shankara_ocr.py`: Extracts Sri Adi Shankaracharya's Advaita Vedanta commentary.
  * `audit_translations.py`: Audits translated JSON datasets for completeness and placeholder elimination.
  * `fix_gita_press_translation.py` & `fix_all_gita_pages.py`: Repairs page sequence alignment and heading artifacts.
  * `inject_missing_shloka_tags.py`: Injects missing Sanskrit shloka markers into commentary passages.

### 2. `scripts/veducation_parsers/` — Veducation Scripture Ingestion
* **Role**: Extracts OCR text scans from Veducation spiritual handbooks into structured page JSON files.
* **Key Scripts**:
  * `extract_boss_ocr.py` & `extract_sanatan_sanskriti_ocr.py`: Parses the *Basics of Sanatan Sanskriti (BOSS)* handbook into structured page records with paragraph tags.
  * `extract_brahmacharya_ocr.py`: Parses the *Brahmacharya (Self-Control & Vitality)* handbook.
  * `extract_vedic_dincharya_ocr.py`: Parses the *Vedic Dincharya (Daily Lifestyle Routine)* handbook.

### 3. `scripts/data_fixes/` — Batch Translation & Page Injection Pipeline
* **Role**: Batch translation pipeline using Groq LLM tool calls to re-translate incomplete pages and inject missing page records.
* **Key Scripts**:
  * `batch_translate_pages.py`: Batch runner that calls Groq LLM APIs to translate Hindi/Sanskrit commentary pages into clean English.
  * `translate_page_67.py`: Specialized translation script for Page 67.
  * `add_pages_19_20_22.py`, `add_pages_196_198_199.py`, `add_pages_197_978_1243.py`: Injection scripts that merged missing page records into `gita_press_translated.json`.

### 4. `scripts/utils/` — Model & API Diagnostic Utilities
* **Role**: Lightweight CLI helper tools.
* **Key Scripts**:
  * `list_groq_models.py`: Connects to Groq API and lists all active, available models (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`).
  * `list_models.py`: Lists available models across OpenRouter and Groq endpoints.

### 5. `scripts/check_pdf_type.py` — PDF Analyzer
* **Role**: Analyzes input PDF files to check whether text layers are native digital text or rasterized image scans requiring Tesseract OCR.
