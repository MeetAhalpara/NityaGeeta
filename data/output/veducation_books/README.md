# Veducation Scripture & OCR Datasets (`data/output/veducation_books/`)

This directory contains preprocessed OCR text datasets from the Veducation spiritual library, including the *Basics of Sanatan Sanskriti (BOSS)* handbook, *Brahmacharya*, and *Vedic Dincharya*. These datasets feed page-level book citations and the interactive Scripture Reader Modal in NityaGeeta.

---

## Dataset Files & Specifications

### 1. `boss_ocr.json` (249 KB) & `basics_of_sanatan_sanskriti_ocr.json` (557 KB)
* **Book Title**: *Basics of Sanatan Sanskriti (BOSS)* by Veducation.
* **Description**: Complete structured OCR dataset of the BOSS handbook, organized into page numbers and paragraph content.
* **Key Topics Covered**:
  * Core principles of Sanatan Sanskriti, Dharma, Karma, and subtle vs. gross body.
  * Practical daily living, meditation, mind control, and spiritual discipline.
* **Backend Usage**:
  * Indexed in `dataset_cache.py` (`search_boss_context`, `search_boss_items`).
  * Displayed in the UI with page number badges (`Page 14`, `Page 88`, `Page 172`).
  * Unwrapped using `unwrap_ocr_paragraphs` helper to eliminate artificial PDF line breaks inside paragraphs.

### 2. `brahmacharya_ocr.json` (529 KB)
* **Book Title**: *Brahmacharya (Self-Control & Vitality)* by Veducation.
* **Description**: Preprocessed OCR dataset focusing on sense control, mental strength, habit transformation, and energy preservation.
* **Usage**: Provides contextual scripture grounding for queries regarding self-discipline, focus, and overcoming addictions.

### 3. `vedic_dincharya_ocr.json` (203 KB)
* **Book Title**: *Vedic Dincharya (Daily Lifestyle Routine)* by Veducation.
* **Description**: OCR dataset detailing ideal morning routines (Brahma Muhurta), dietary habits, physical wellness, and evening reflection according to Ayurvedic and Vedic traditions.
* **Usage**: Provides structured lifestyle advice when users query daily habits, wellness, or routine optimization.

---

## Data Structure Example

Each item inside these JSON files follows a clean, page-indexed structure:

```json
{
  "page": 14,
  "source": "Basics of Sanatan Sanskriti (BOSS)",
  "text": "We shape our subtle body by our thoughts, desires and actions. And that subtle body gives shape to our gross body..."
}
```
