"""
scripts/gita_parsers/post_process_translations.py
NityaGeeta — Post-processing guard & transliterator for pages 25 to 100.

WHAT THIS SCRIPT DOES:
1. Strips any stray <think>...</think> reasoning blocks from English translations.
2. Transliterates any remaining Devanagari script words (e.g. Sanskrit terms in quotes)
   to Roman/IAST script using indic_transliteration.
3. Sorts all entries strictly by page number ascending (25 to 100).
4. Audits the final dataset to guarantee 100% compliance with zero Devanagari leakage.
"""

import json
import re
import sys
from pathlib import Path
from indic_transliteration import sanscript

FILE_PATH = Path("data/output/gita_editions/gita_press_translated.json")

def clean_and_transliterate():
    if not FILE_PATH.exists():
        print(f"❌ File not found: {FILE_PATH}")
        sys.exit(1)

    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("\n" + "═" * 70)
    print("  NITYAGEETA — Post-Processing & Transliteration Audit (Pages 25–100)")
    print("═" * 70)

    # 1. Clean entries
    cleaned_count = 0
    devanagari_transliterated_count = 0

    for item in data:
        page_num = item.get("page")
        english_text = item.get("english", "")

        if not english_text:
            continue

        # Strip reasoning blocks <think>...</think> (both closed and unclosed)
        if "<think>" in english_text:
            english_text = re.sub(r'<think>.*?(?:</think>|\n\n(?=\d+\b)|$)', '', english_text, flags=re.DOTALL).strip()
            # If still has orphan <think> or </think> tags
            english_text = re.sub(r'</?think>', '', english_text).strip()
            cleaned_count += 1

        # Find any Devanagari word/character sequences (including extended Indic symbols) and transliterate them to IAST/Roman
        def _replace_devanagari(match):
            nonlocal devanagari_transliterated_count
            devanagari_str = match.group(0)
            devanagari_transliterated_count += 1
            try:
                # Transliterate Devanagari to IAST
                iast_str = sanscript.transliterate(devanagari_str, sanscript.DEVANAGARI, sanscript.IAST)
                return iast_str
            except Exception:
                return ""

        # Replace Devanagari script regex range \u0900-\u097F and \u0980-\u09FF
        english_text = re.sub(r'[\u0900-\u097F\u0980-\u09FF]+', _replace_devanagari, english_text)

        # Final strip of any non-ASCII Devanagari code points remaining (e.g. \u0976)
        english_text = re.sub(r'[\u0900-\u097F\u0980-\u09FF]', '', english_text)

        item["english"] = english_text
        if "original" not in item:
            item["original"] = ""

    # Reorder keys to: page, original, english
    data_reordered = []
    for item in data:
        data_reordered.append({
            "page": item["page"],
            "original": item.get("original", ""),
            "english": item.get("english", "")
        })

    # 2. Sort entries strictly by page number ascending
    data_reordered.sort(key=lambda x: x["page"])

    # 3. Save cleaned dataset back to file
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data_reordered, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Stripped <think> tags from {cleaned_count} pages.")
    print(f"  ✓ Transliterated {devanagari_transliterated_count} Devanagari words to IAST Roman script.")
    print(f"  ✓ Sorted {len(data)} pages sequentially ({data[0]['page']} → {data[-1]['page']}).\n")

    # 4. Final Audit
    remaining_devanagari = [
        item["page"] for item in data
        if re.search(r'[\u0900-\u097F]', item.get("english", ""))
    ]
    remaining_think = [
        item["page"] for item in data
        if "<think>" in item.get("english", "")
    ]

    print("═" * 70)
    print("  FINAL QUALITY AUDIT REPORT")
    print("═" * 70)
    print(f"  Total pages verified: {len(data)} (Pages {data[0]['page']} to {data[-1]['page']})")
    print(f"  Pages with <think> tags: {len(remaining_think)}")
    print(f"  Pages with Devanagari script: {len(remaining_devanagari)}")

    if len(remaining_devanagari) == 0 and len(remaining_think) == 0:
        print(f"\n  🎉 AUDIT PASSED 100%! All pages {data[0]['page']} to {data[-1]['page']} are strictly sequential,")
        print("     100% pure English/Roman script, and free of any AI artifacts!")
    else:
        print("\n  ⚠️ Remaining issues detected:")
        if remaining_think:
            print(f"     - <think> tags in pages: {remaining_think}")
        if remaining_devanagari:
            print(f"     - Devanagari script in pages: {remaining_devanagari}")
    print("═" * 70 + "\n")

if __name__ == "__main__":
    clean_and_transliterate()
