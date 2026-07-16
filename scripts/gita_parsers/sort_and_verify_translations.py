"""
scripts/gita_parsers/sort_and_verify_translations.py
NityaGeeta — Sort and Verify Gita Press Translations (Pages 25 to 100)

WHAT THIS SCRIPT DOES:
  1. Audits all translated pages to verify ZERO Devanagari characters remain in English text.
  2. Arranges/sorts all translated entries in strict numerical sequence by page number (25 -> 100).
  3. Saves the clean, ordered JSON file back to ./data/output/gita_editions/gita_press_translated.json.
"""

import os
import re
import json
from pathlib import Path

TRANS_OUTPUT = "./data/output/gita_editions/gita_press_translated.json"
DEVA_PATTERN = re.compile(r'[\u0900-\u097F]+')

def sort_and_verify():
    if not os.path.exists(TRANS_OUTPUT):
        print(f"Error: {TRANS_OUTPUT} does not exist.")
        return

    with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("══════════════════════════════════════════════════════════════════════")
    print("  STEP 1: Checking Devanagari Script in English Output")
    print("══════════════════════════════════════════════════════════════════════")

    deva_issues = []
    for item in data:
        page_num = item["page"]
        eng_text = item.get("english", "")
        matches = DEVA_PATTERN.findall(eng_text)
        if matches:
            deva_issues.append((page_num, len(matches), matches[:5]))

    if deva_issues:
        print(f"⚠️ Found Devanagari script in {len(deva_issues)} pages:")
        for p, count, sample in sorted(deva_issues):
            print(f"  - Page {p:3d}: {count} Devanagari words (e.g. {sample})")
    else:
        print("  🟢 Perfect! 0 Devanagari script words found in all English translations.")

    print("\n══════════════════════════════════════════════════════════════════════")
    print("  STEP 2: Sorting Pages sequentially (25 -> 100)")
    print("══════════════════════════════════════════════════════════════════════")

    # Sort array by page number ascending
    data.sort(key=lambda x: x["page"])

    page_numbers = [item["page"] for item in data]
    print(f"  Total pages sorted: {len(data)}")
    print(f"  Page range: {min(page_numbers)} to {max(page_numbers)}")

    # Save sorted output
    with open(TRANS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  ✅ Saved sorted translations to: {TRANS_OUTPUT}")

if __name__ == "__main__":
    sort_and_verify()
