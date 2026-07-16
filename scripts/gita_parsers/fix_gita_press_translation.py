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
from groq import Groq

# ── Load environment variables ──────────────────────────────────────────────
load_dotenv()

# ── File paths ───────────────────────────────────────────────────────────────
ORIGINAL_JSON = "./data/output/gita_editions/Srimad Bhagavad Gita Press Gorakhpur.json"
TRANS_OUTPUT  = "./data/output/gita_editions/gita_press_translated.json"

# ── Translation settings ──────────────────────────────────────────────────────
# Main model is the high-quality 70B model. Fallback is the 8B model with 10x higher limits.
TRANS_MODEL_PRIMARY  = "llama-3.3-70b-versatile"
TRANS_MODEL_FALLBACK = "llama-3.1-8b-instant"
TRANS_SAVE_EVERY = 5       # Save translation progress every N pages

# ── System prompt for translation ────────────────────────────────────────────
TRANSLATION_SYSTEM_PROMPT = """You are an expert translator of Sanskrit and Hindi religious texts into English.
You specialize in the Bhagavad Gita and its commentaries published by Gita Press, Gorakhpur.

════════════════════════════════════════
YOUR ONLY JOB: TRANSLATE TO ENGLISH
════════════════════════════════════════

The input is text from the Bhagavad Gita (Gita Press edition) written in Devanagari script.
It contains Sanskrit shlokas (verses) and Hindi commentary.

CRITICAL RULES — READ CAREFULLY:

❶ LINE 1 MUST BE THE PAGE NUMBER
   - Start your translation on Line 1 with the exact Page Number as an Arabic numeral (e.g., "94" for page 94, "100" for page 100).
   - Do NOT start with "Chapter X, Verse Y" or Markdown headings if there is commentary above it.

❷ TOP-TO-BOTTOM COMPLETE TRANSLATION — NEVER SKIP TOP COMMENTARY
   - Pages frequently start with the continuation of commentary from the previous verse at the top.
   - YOU MUST TRANSLATE THE TOP COMMENTARY FIRST before translating any shloka that appears mid-page.
   - DO NOT jump straight to a shloka/verse banner mid-page and ignore the text above it!
   - Translate all sections in strict top-to-bottom sequence:
     [Page Number] -> [Top Commentary Continuation] -> [Appendix / Parishishta Bhaav] -> [Sambandh / Connection] -> [Shloka & Breakdown] -> [Bottom Commentary].

❸ TRANSLATE EVERYTHING TO ENGLISH — NO DEVANAGARI SCRIPT ALLOWED
   - Absolute Rule: The output MUST NOT contain ANY Devanagari characters (e.g. 'अ', 'क', '१').
   - For word-by-word shloka breakdowns, write Roman transliteration + English meaning:
     Example: "karpanya-dosha-upahata-svabhavah: a heart afflicted by cowardice"
   - Every single word of Hindi and Sanskrit MUST be translated to English.

❹ NEVER REPEAT YOURSELF
   - Write each idea ONCE. Do not copy the same sentence or paragraph twice.
   - If you catch yourself writing the same phrase again — STOP and move to the next paragraph.

❺ NUMBERS: Convert Devanagari digits to Arabic digits
   - ०=0, १=1, २=2, ३=3, ४=4, ५=5, ६=6, ७=7, ८=8, ९=9
   - Page header "६४" → write "64"
   - Verse reference "२।७" → write "2.7"

❻ SPECIAL TERMS: Write in Roman script with English translation in parentheses
   - "Atman" (the eternal soul)
   - "Dharma" (righteous duty)
   - "Moksha" (liberation)
   - "Karma" (action and its consequences)
   - "Brahman" (the Supreme Consciousness)

❼ OUTPUT ONLY THE ENGLISH TRANSLATION
   - Do not add explanations about what you did.
   - Do not write "Here is the translation:" or any preamble.
   - Start Line 1 with the page number immediately.

Begin translating now:"""

def translate_text(text: str, client, page_num: int, use_fallback: bool = False) -> str:
    """
    Translate a block of Hindi/Sanskrit text to English using Groq API.
    Falls back to the 8B model if the primary model hits limits.
    """
    if not text or len(text.strip()) < 10:
        return text

    model = TRANS_MODEL_FALLBACK if use_fallback else TRANS_MODEL_PRIMARY

    # 70B model has generous limits; 8B model has a strict 6000 TPM cap.
    # System prompt (~900 tokens) + page text (~800 tokens) + max_tokens must stay under 6000.
    max_out = 1800 if use_fallback else 4096

    # Call Groq API
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
            {"role": "user",   "content": text}
        ],
        temperature=0.3,   # Slightly higher than before to prevent repetition loops
        max_tokens=max_out
    )
    raw = response.choices[0].message.content.strip()
    return _deduplicate_output(raw, page_num)


def _deduplicate_output(text: str, page_num: int = None) -> str:
    """
    Post-processing guard: removes repeated paragraphs from AI output
    and ensures Line 1 of the output starts with the exact numeric page header.
    """
    if not text:
        return text

    # Strip hallucinated prompt example sentences if model prefixed them to the translation
    artifact_phrases = [
        "In the Gita, the dialogue of Shri Krishna and Arjuna begins and ends in devotion",
        "In the Gita, the dialogue of Shri Krishna and Arjuna",
    ]
    for phrase in artifact_phrases:
        if text.startswith(phrase):
            # Strip phrase and any leading punctuation/spaces/newlines
            text = text[len(phrase):].lstrip("., :-–\n")
        # Also clean if it appears after page number line like "90\n\nIn the Gita..."
        text = re.sub(r'^(\d+\s*\n\s*)' + re.escape(phrase) + r'[,.\s–-]*', r'\1', text, flags=re.IGNORECASE)

    # Split into paragraphs (double newline separated)
    paragraphs = re.split(r'\n{2,}', text)

    seen = []
    seen_set = set()
    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            continue
        # Normalize for comparison (ignore minor whitespace differences)
        key = ' '.join(stripped.split()).lower()[:200]  # first 200 chars as fingerprint
        if key not in seen_set:
            seen_set.add(key)
            seen.append(stripped)

    out_text = '\n\n'.join(seen)

    # Prepend Page Number if missing from Line 1
    if page_num is not None:
        first_line = out_text.split('\n')[0].strip()
        if not re.match(rf"^{page_num}\b", first_line):
            out_text = f"{page_num}\n\n{out_text}"

    # Also deduplicate at sentence level within each paragraph
    # (catches cases where a single paragraph has repeated sentences)
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
    Translate original Hindi/Sanskrit text to English.
    Reads from ORIGINAL_JSON and writes to TRANS_OUTPUT.
    Saves progress incrementally.
    """
    print("\n" + "═" * 70)
    print("  TRANSLATION — Groq Llama 3 (High Speed & Free)")
    print("═" * 70)

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("\n❌  GROQ_API_KEY not found in .env")
        sys.exit(1)

    # Initialize the Groq Client
    client = Groq(api_key=api_key)

    if not os.path.exists(ORIGINAL_JSON):
        print(f"\n❌  Original JSON not found: {ORIGINAL_JSON}")
        sys.exit(1)

    # Load original JSON data
    with open(ORIGINAL_JSON, "r", encoding="utf-8") as f:
        ocr_data: list[dict] = json.load(f)

    # Filter to requested page range
    if end_page is None:
        end_page = max(item["page"] for item in ocr_data)

    pages_to_translate = [
        item for item in ocr_data
        if start_page <= item["page"] <= end_page
    ]

    print(f"\n  Original JSON source: {ORIGINAL_JSON}  ({len(ocr_data)} pages total)")
    print(f"  Processing:   Page {start_page} → {end_page}  ({len(pages_to_translate)} pages)")
    print(f"  Primary Model: {TRANS_MODEL_PRIMARY}")
    print(f"  Fallback Model:{TRANS_MODEL_FALLBACK}")
    print(f"  Output:       {TRANS_OUTPUT}\n")

    # Load existing translation progress (allows resuming)
    translated_data: list[dict] = []
    translated_pages: set[int]  = set()

    if os.path.exists(TRANS_OUTPUT):
        try:
            with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
                translated_data  = json.load(f)
                translated_pages = {item["page"] for item in translated_data}
                if force:
                    print(f"  ⚠️  FORCE mode: will overwrite pages {start_page}–{end_page} even if already translated.")
                    # Remove forced pages from translated_data so they get re-done
                    translated_data = [item for item in translated_data
                                       if item["page"] < start_page or item["page"] > end_page]
                    translated_pages = {item["page"] for item in translated_data}
                print(f"  Resuming: {len(translated_pages)} pages already translated.\n")
        except Exception:
            print("  Could not read existing translation output — starting fresh.\n")

    pages_done = 0
    use_fallback = False
    for item in pages_to_translate:
        page_num = item["page"]

        if page_num in translated_pages:
            print(f"  Page {page_num:4d}: skipped (already translated)")
            continue

        original_text = item.get("text", "").strip()
        if not original_text:
            print(f"  Page {page_num:4d}: empty — skipping")
            translated_data.append({
                "page": page_num,
                "original": "",
                "english": ""
            })
            continue

        print(f"  Page {page_num:4d}: translating... ({len(original_text)} chars)", end=" ", flush=True)

        try:
            # Try primary first, fallback if toggle is on
            english_text = translate_text(original_text, client, page_num=page_num, use_fallback=use_fallback)
            
            translated_data.append({
                "page":     page_num,
                "original": original_text,
                "english":  english_text
            })
            pages_done += 1
            model_used = "8B" if use_fallback else "70B"
            print(f"✓ [{model_used}] → {len(english_text)} chars English")

            # Small safety delay to prevent hitting rate limits (Groq is very fast)
            time.sleep(2.0)

            # Save progress periodically
            if pages_done % TRANS_SAVE_EVERY == 0:
                _save_json(TRANS_OUTPUT, translated_data)
                print(f"  → Progress saved ({len(translated_data)} pages translated)\n")

        except Exception as exc:
            err_msg = str(exc)
            is_rate_limit = ("rate_limit_exceeded" in err_msg or "429" in err_msg
                             or "Rate limit" in err_msg or "tokens per minute" in err_msg)

            if not is_rate_limit:
                # Non-rate-limit error — save and stop
                print(f"\n  ❌ Translation failed on page {page_num}: {exc}")
                print("  Progress saved. Re-run to resume from this point.")
                break

            # ── Rate limit: try to recover with wait+retry ────────────────────
            recovered = False

            # Extract suggested wait time from error message (e.g. "try again in 10.69s")
            wait_match = re.search(r'try again in ([0-9.]+)s', err_msg)
            suggested_wait = float(wait_match.group(1)) if wait_match else 20.0
            wait_secs = max(suggested_wait + 5, 20)  # add 5s buffer, minimum 20s

            if not use_fallback:
                # 70B hit limit — switch to 8B first
                print(f"\n⚠️  Primary model (70B) rate limit. Switching to 8B fallback...")
                use_fallback = True

            # Try 8B with up to 3 retries (waiting between each)
            for attempt in range(1, 4):
                try:
                    print(f"  ⏳ Waiting {wait_secs:.0f}s before retry {attempt}/3...", flush=True)
                    time.sleep(wait_secs)
                    english_text = translate_text(original_text, client, page_num=page_num, use_fallback=True)
                    translated_data.append({
                        "page":     page_num,
                        "original": original_text,
                        "english":  english_text
                    })
                    pages_done += 1
                    print(f"✓ [8B-retry-{attempt}] → {len(english_text)} chars English")
                    time.sleep(2.0)
                    recovered = True
                    break
                except Exception as retry_exc:
                    retry_msg = str(retry_exc)
                    if "429" in retry_msg or "rate_limit" in retry_msg or "Rate limit" in retry_msg:
                        wait_match2 = re.search(r'try again in ([0-9.]+)s', retry_msg)
                        wait_secs = float(wait_match2.group(1)) + 5 if wait_match2 else 30.0
                        wait_secs = max(wait_secs, 20)
                        print(f"\n  ⚠️  Still rate limited on attempt {attempt}. Will retry...")
                    else:
                        print(f"\n  ❌ Non-rate-limit error on retry: {retry_exc}")
                        break

            if not recovered:
                _save_json(TRANS_OUTPUT, translated_data)
                print(f"\n  ❌ Could not translate page {page_num} after 3 retries. Progress saved.")
                print("  Re-run the command to resume from here.")
                break

    _save_json(TRANS_OUTPUT, translated_data)
    print(f"\n  ✅ Translation Complete. {len(translated_data)} pages in: {TRANS_OUTPUT}")


# ═══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def _save_json(path: str, data: list) -> None:
    """Save JSON with UTF-8 encoding (required for Devanagari text)."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


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
    print("═" * 70)
    print("  NITYAGEETA — Gita Press Hindi/Sanskrit → English Translation")
    print(f"  Python {sys.version.split()[0]}")
    print("═" * 70)

    args = _parse_args()

    run_translation(args.start, args.end, force=args.force)

    print("\n═" * 70)
    print("  Done.")


if __name__ == "__main__":
    main()
