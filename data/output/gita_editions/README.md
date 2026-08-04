# Canonical Bhagavad Gita Scripture Datasets (`data/output/gita_editions/`)

This directory contains the primary, verified, and preprocessed canonical datasets for the 700 Bhagavad Gita Shlokas and historical commentaries. These files feed NityaGeeta's in-memory RAG index (<2ms lookup) and Weaviate Cloud vector search engine.

---

## Primary Dataset Files

### 1. `gita_press_translated.json` (17.7 MB)
* **Description**: Consolidated, fully translated 1,296-page English edition of the *Srimad Bhagavad Gita Sadhaka-Sanjivani* by Swami Ramsukhdas (Gita Press Gorakhpur).
* **Metrics**:
  * **Coverage**: 1,296 / 1,296 pages (100% complete).
  * **Quality**: 99.61% clean translations (0 placeholder errors, 0 `<think>` tags).
* **Usage**: Provides comprehensive practical commentary (Sadhana perspective) and detailed verse explanations.

### 2. `Gita-Sadhak-Sanjevani-English.json` (4.35 MB)
* **Description**: Verse-level English commentary dataset extracted from Sadhaka-Sanjivani.
* **Usage**: Ingested into the in-memory verse index (`verse_index.py`) for rapid lookup by chapter and verse number.

### 3. `The Bhagavad Gita Winthrop Sargeant (Word-for-Word English).json` (1.28 MB)
* **Description**: Complete word-for-word Sanskrit-to-English translation and grammatical analysis by Winthrop Sargeant.
* **Usage**: Used to verify exact Sanskrit vocabulary meanings, grammatical roots, and English transliterations.

### 4. `Bhagavad Gita with the Commentary of Adi Shankaracharya.json` (969 KB)
* **Description**: Classical Advaita Vedanta commentary by Sri Adi Shankaracharya, translated into English.
* **Usage**: Powers Brain 2 (Advaita Vedanta perspective), providing non-dual philosophical analysis of Gita Shlokas.

### 5. `Srimad Bhagavad Gita Press Gorakhpur.json` (11.6 MB)
* **Description**: Source raw OCR text dataset extracted from the original printed Gita Press Gorakhpur publication.
* **Usage**: Serves as the authoritative source text for translation verification and structural alignment.

---

## Audit & Utility Files

* `missing_pages.json` (3.84 MB): Log of pages repaired during the translation cleanup pipeline.
* `translation_audit_report.md` (6.2 KB): Quality metric audit report summarizing page completeness, translation integrity, and placeholder elimination.
* `untranslated_terms.md` (2.7 KB): Reference catalog of specific Sanskrit technical terms (e.g., *Svyam-Siddha*, *Antahkarana*) retained for philosophical precision.
* `pages_to_retranslate.txt` (1.3 KB): Historical tracking list of pages processed during dataset translation repair.
* `pages/` (Directory): Individual per-page JSON files generated during extraction and repair workflows.
