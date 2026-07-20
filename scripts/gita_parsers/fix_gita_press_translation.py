"""
scripts/gita_parsers/fix_gita_press_translation.py
NityaGeeta — Gita Press Hindi/Sanskrit → English Translation (Groq Free Tier Version)

WHAT THIS SCRIPT DOES:
  Translates the clean text (Devanagari Hindi commentary + Sanskrit shlokas)
  to English using Groq's high-speed API with Llama 3 70B model.
  The system prompt is carefully crafted to preserve:
    - Philosophical meaning (not simplified)
    - Sanskrit technical terms kept in parentheses
    - The devotional, reverential tone of Gita Press/Swami Chinmayananda
    - Verse references and chapter numbering

HOW TO RUN:
  1. Make sure your virtual environment is active:
       .venv\\Scripts\\activate
  
  2. Run the translation script:
       python scripts/gita_parsers/fix_gita_press_translation.py --start 25 --end 100

  3. Check output file at:
       data/output/gita_editions/gita_press_translated.json

REQUIREMENTS:
  - GROQ_API_KEY in your .env file
  - Python packages: groq python-dotenv
    Install: pip install groq python-dotenv
"""

import os
import re
import sys
import json
import time
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Ensure root directory is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from groq import Groq
from openai import OpenAI

# ── Load environment variables ──────────────────────────────────────────────
load_dotenv()

# ── File paths ───────────────────────────────────────────────────────────────
ORIGINAL_JSON = "./data/output/gita_editions/Srimad Bhagavad Gita Press Gorakhpur.json"
TRANS_OUTPUT  = "./data/output/gita_editions/gita_press_translated.json"

# ── Translation Model Tiers ───────────────────────────────────────────────────
# Tier 1 (Best): 70B Versatile
# Tier 2 (Better): 120B / 27B OSS Models
# Tier 3 (Good): 8B Instant
MODEL_TIER_1 = ["llama-3.3-70b-versatile"]
MODEL_TIER_2 = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"]
MODEL_TIER_3 = ["llama-3.1-8b-instant"]

ALL_MODEL_TIERS = [MODEL_TIER_1, MODEL_TIER_2, MODEL_TIER_3]

def is_defective_translation(page_num: int, eng_text: str, orig_text: str) -> bool:
    eng = (eng_text or "").strip()
    orig = (orig_text or "").strip()
    if orig and not eng:
        return True
    if "Maharshi Vedavyasa had a lot of affection" in eng and page_num not in [25, 26]:
        return True
    if orig and len(orig) > 200 and len(eng) < 50:
        return True
    return False

TRANS_SAVE_EVERY = 5       # Save translation progress every N pages

# Global round-robin index for key rotation
_GROQ_KEY_INDEX = 0

def get_groq_clients() -> list:
    """Collect all available Groq API keys from .env into a list of Groq clients."""
    keys = []
    # Collect GROQ_API_KEY, GROQ_API_KEY2, GROQ_API_KEY3...
    for k, v in os.environ.items():
        if k.startswith("GROQ_API_KEY") and v.strip():
            keys.append(v.strip())

    # Ensure unique keys maintaining order
    seen = set()
    unique_keys = []
    for k in keys:
        if k not in seen:
            seen.add(k)
            unique_keys.append(k)

    clients = [Groq(api_key=k, timeout=180.0) for k in unique_keys]
    return clients

# ── System prompt for translation ────────────────────────────────────────────
TRANSLATION_SYSTEM_PROMPT = """You are an expert translator of Sanskrit and Hindi religious texts into English.
You specialize in the Bhagavad Gita and its commentaries published by Gita Press, Gorakhpur.

════════════════════════════════════════
YOUR ONLY JOB: TRANSLATE TO ENGLISH
════════════════════════════════════════

The input is text from the Bhagavad Gita (Gita Press edition) written in Devanagari script.
It contains Sanskrit shlokas (verses) and Hindi commentary.

CRITICAL RULES — READ CAREFULLY:

❶ LINE 1 MUST BE THE PAGE NUMBER ONLY
   - Start Line 1 with the exact main page number as an Arabic numeral (e.g. 531).
   - Do NOT output stray 2-digit corner page numbers (like 53 or 56). Output ONLY the main 3-digit page number.

❷ ALWAYS TRANSLATE CHAPTER AND VERSE BANNERS
   - If original has `[ अध्याय ९ ]` or `अध्याय ९`, translate as `[ Chapter 9 ]`.
   - If original has `श्लोक २१ ]` or `श्लोक २१`, translate as `[ Verse 21 ]`.
   - If original has `* श्रीमद्भगवद्गीता *`, translate as `* Srimad Bhagavad Gita *`.
   - NEVER omit or skip these chapter and verse banners!

❸ TOP-TO-BOTTOM COMPLETE TRANSLATION — NEVER SKIP TOP COMMENTARY
   - Pages frequently start with the continuation of commentary from the previous verse at the top.
   - YOU MUST TRANSLATE THE TOP COMMENTARY FIRST before translating any shloka that appears mid-page.
   - Translate all sections in strict top-to-bottom sequence:
     [Page Number] -> [Header Banner] -> [Top Commentary Continuation] -> [Appendix / Parishishta Bhaav] -> [Sambandh / Connection] -> [Shloka & Breakdown] -> [Bottom Commentary].

❹ TRANSLATE EVERYTHING TO ENGLISH — NO DEVANAGARI SCRIPT ALLOWED
   - Absolute Rule: The output MUST NOT contain ANY Devanagari characters (e.g. 'अ', 'क', '१').
   - For word-by-word shloka breakdowns, write Roman transliteration + English meaning:
     Example: "karpanya-dosha-upahata-svabhavah: a heart afflicted by cowardice"

❺ NEVER REPEAT YOURSELF
   - Write each idea ONCE. Do not copy the same sentence or paragraph twice.

❻ NUMBERS: Convert Devanagari digits to Arabic digits
   - ०=0, १=1, २=2, ३=3, ४=4, ५=5, ६=6, ७=7, ८=8, ९=9
   - Verse reference "२।७" → write "2.7"

❼ SPECIAL TERMS: Write in Roman script with English translation in parentheses
   - "Atman" (the eternal soul), "Dharma" (righteous duty), "Moksha" (liberation), "Karma" (action), "Brahman" (Supreme Consciousness).

❽ OUTPUT ONLY THE ENGLISH TRANSLATION — NO PREAMBLE

Begin translating now:"""

def translate_text(text: str, client, page_num: int, model_name: str | None = None) -> str:
    """
    Translate a block of Hindi/Sanskrit text to English using Groq API.
    """
    if not text or len(text.strip()) < 10:
        return text

    model = model_name or MODEL_TIER_1[0]
    active_client = client

    max_out = 2048 if ("8b" in model or "3b" in model) else 4096

    # Call LLM API
    response = active_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
            {"role": "user",   "content": f"Translate the following page text to English (Page {page_num}):\n\n{text}"}
        ],
        temperature=0.2,
        max_tokens=max_out
    )
    raw = response.choices[0].message.content or ""
    raw = raw.strip()

    if not raw or len(raw) < 50:
        raise ValueError(f"Model {model} returned empty or insufficient output ({len(raw)} chars)")

    devanagari_chars = re.findall(r'[\u0900-\u097F]', raw)
    if len(devanagari_chars) > 5:
        raise ValueError(f"Devanagari script leakage detected ({len(devanagari_chars)} chars) in output of model {model}")

    out = _deduplicate_output(raw, page_num)
    if not out or len(out) < 50:
        raise ValueError(f"Post-deduplication output too short ({len(out)} chars) for model {model}")

    return out


def _deduplicate_output(text: str, page_num: int = None) -> str:
    """
    Post-processing guard: removes repeated paragraphs from AI output
    and ensures Line 1 of the output starts with the exact numeric page header.
    Removes stray corner numbers (53, 55, 56) and slash artifacts (564/56).
    """
    if not text:
        return text

    # Strip reasoning blocks <think>...</think>
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

    # Strip stray 2-digit numbers or slash page numbers after page header line (e.g., 531 \n\n 53 -> 531)
    if page_num is not None:
        p_str = str(page_num)
        text = re.sub(rf'^\s*{p_str}\s*\n+\s*(?:\d{{1,2}}|{p_str}/\d{{1,2}}|1\.\s*\d{{1,2}})\s*\n+', f'{p_str}\n\n', text)
        text = re.sub(rf'^\s*{p_str}\s*\n+\s*1\.\s*({p_str[:2]}|\d{{1,2}})\s*\n+', f'{p_str}\n\n', text)

    # Split into paragraphs (double newline separated)
    paragraphs = re.split(r'\n{2,}', text)

    seen = []
    seen_set = set()
    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            continue
        key = ' '.join(stripped.split()).lower()[:200]
        if key not in seen_set:
            seen_set.add(key)
            seen.append(stripped)

    out_text = '\n\n'.join(seen)

    # Prepend Page Number if missing from Line 1
    if page_num is not None:
        first_line = out_text.split('\n')[0].strip()
        if not re.match(rf"^{page_num}\b", first_line):
            out_text = f"{page_num}\n\n{out_text}"

    sentences = re.split(r'(?<=[.!?])\s+', out_text)
    unique_sentences = []
    sent_seen = set()
    for sent in sentences:
        key = ' '.join(sent.split()).lower()[:150]
        if key not in sent_seen:
            sent_seen.add(key)
            unique_sentences.append(sent)

    return ' '.join(unique_sentences).strip()


def run_translation(start_page: int, end_page: int | None, force: bool = False):
    """
    Translate original Hindi/Sanskrit text to English using Multi-Key Multi-Tier Rotation.
    Automatically detects and translates ALL missing pages in range, inserting them sequentially.
    """
    global _GROQ_KEY_INDEX

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("\n" + "═" * 70)
    print("  TRANSLATION — Multi-Key Multi-Tier Groq Engine (Gap-Free Auto-Detector)")
    print("═" * 70)

    groq_clients = get_groq_clients()
    if not groq_clients:
        print("\n❌ No GROQ_API_KEY found in .env")
        sys.exit(1)

    print(f"  Loaded {len(groq_clients)} active Groq API keys for round-robin rotation!")
    print(f"  Tier 1 (BEST):   {MODEL_TIER_1}")
    print(f"  Tier 2 (BETTER): {MODEL_TIER_2}")
    print(f"  Tier 3 (GOOD):   {MODEL_TIER_3}")

    if not os.path.exists(ORIGINAL_JSON):
        print(f"\n❌ Original JSON not found: {ORIGINAL_JSON}")
        sys.exit(1)

    with open(ORIGINAL_JSON, "r", encoding="utf-8") as f:
        ocr_data: list[dict] = json.load(f)

    if end_page is None:
        end_page = max(item["page"] for item in ocr_data)

    translated_data_map: dict[int, dict] = {}

    if os.path.exists(TRANS_OUTPUT):
        try:
            with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
                raw_list = json.load(f)
                translated_data_map = {item["page"]: item for item in raw_list}
                print(f"  Resuming: {len(translated_data_map)} pages already present in JSON.\n")
        except Exception:
            print("  Could not read existing translation output — starting fresh.\n")

    translated_pages = {
        page_num for page_num, data in translated_data_map.items()
        if not is_defective_translation(page_num, data.get("english", ""), data.get("original", ""))
    }

    # Detect ALL pages to translate between start_page and end_page
    pages_to_translate = [
        item for item in ocr_data
        if start_page <= item["page"] <= end_page and (item["page"] not in translated_pages or force)
    ]
    pages_to_translate.sort(key=lambda x: x["page"])

    print(f"  Original JSON source: {ORIGINAL_JSON}  ({len(ocr_data)} pages total)")
    print(f"  Pages to Translate: {len(pages_to_translate)} pages in target range ({start_page} → {end_page})")
    if pages_to_translate:
        sample_missing = [p["page"] for p in pages_to_translate[:10]]
        print(f"  Next Pages Queue: {sample_missing}...")
    print(f"  Output:       {TRANS_OUTPUT}\n")

    pages_done = 0

    for item in pages_to_translate:
        page_num = item["page"]

        original_text = item.get("text", "").strip()
        is_garbage = (
            not original_text or
            original_text.count("गीता") > 30 or
            (len(original_text) > 500 and len(set(original_text)) < 30)
        )
        if is_garbage:
            print(f"  Page {page_num:4d}: decorative/blank page — skipping")
            translated_data_map[page_num] = {
                "page": page_num,
                "original": "",
                "english": ""
            }
            _save_json(TRANS_OUTPUT, list(translated_data_map.values()))
            continue

        print(f"  Page {page_num:4d}: translating... ({len(original_text)} chars)", end=" ", flush=True)

        translated_ok = False

        # Multi-Tier Strategy
        for tier_idx, model_tier in enumerate(ALL_MODEL_TIERS, start=1):
            for model in model_tier:
                num_keys = len(groq_clients)
                for key_offset in range(num_keys):
                    key_idx = (_GROQ_KEY_INDEX + key_offset) % num_keys
                    client = groq_clients[key_idx]

                    try:
                        english_text = translate_text(original_text, client, page_num=page_num, model_name=model)
                        translated_data_map[page_num] = {
                            "page":     page_num,
                            "original": original_text,
                            "english":  english_text
                        }
                        pages_done += 1
                        _GROQ_KEY_INDEX = (key_idx + 1) % num_keys  # advance round-robin pointer
                        
                        short_model = model.split("/")[-1].replace("llama-3.3-70b-versatile", "70b-v").replace("llama-3.1-8b-instant", "8b-i")
                        print(f"✓ [Key#{key_idx+1}-{short_model}] → {len(english_text)} chars")
                        time.sleep(0.5)

                        if pages_done % TRANS_SAVE_EVERY == 0:
                            _save_json(TRANS_OUTPUT, list(translated_data_map.values()))
                            print(f"  → Progress saved ({len(translated_data_map)} total pages preserved in JSON)\n")

                        translated_ok = True
                        break
                    except Exception as exc:
                        err_msg = str(exc)
                        if any(k in err_msg for k in ["429", "402", "rate_limit", "Rate limit", "credit", "credits"]):
                            continue
                        elif "Devanagari script leakage" in err_msg:
                            continue
                        else:
                            continue
                if translated_ok: break
            if translated_ok: break

        if not translated_ok:
            print("\n  ⏳ All keys rate-limited. Waiting 20s...", flush=True)
            time.sleep(20.0)

    _save_json(TRANS_OUTPUT, list(translated_data_map.values()))
    print(f"\n  ✅ Translation batch saved. {len(translated_data_map)} total pages in: {TRANS_OUTPUT}")

    try:
        from scripts.gita_parsers.post_process_translations import clean_and_transliterate
        from scripts.gita_parsers.inject_missing_shloka_tags import sync_all_shlokas
        print("  Running post-processing and shloka tag alignment...")
        clean_and_transliterate()
        sync_all_shlokas()
    except Exception as post_err:
        print(f"  ⚠️ Post-processing error (non-fatal): {post_err}")

    return True


# ═══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def _save_json(path: str, data: list) -> None:
    """Save JSON with UTF-8 encoding, sorted strictly by page number."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    page_map = {item["page"]: item for item in data}
    sorted_data = [page_map[p] for p in sorted(page_map.keys())]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)


def _parse_args():
    parser = argparse.ArgumentParser(
        description="NityaGeeta — Gita Press Hindi/Sanskrit → English Translation"
    )
    parser.add_argument(
        "--start",
        type=int,
        default=25,
        help="Start page number (default: 25)"
    )
    parser.add_argument(
        "--end",
        type=int,
        default=None,
        help="End page number (default: last page of PDF)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        default=False,
        help="Force re-translation even if page already exists in output (use to fix bad pages)"
    )
    return parser.parse_args()


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("═" * 70)
    print("  NITYAGEETA — Gita Press Hindi/Sanskrit → English Translation")
    print(f"  Python {sys.version.split()[0]}")
    print("═" * 70)

    args = _parse_args()

    run_translation(args.start, args.end, force=args.force)

    print("\n" + "═" * 70)
    print("  Done.")


if __name__ == "__main__":
    main()
