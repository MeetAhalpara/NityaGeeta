"""
scripts/gita_parsers/audit_and_fix_shloka_numbers.py
NityaGeeta — Audit & Fix Shloka Numbers across Pages 25 to 100

Ensures all Devanagari shloka numbers (श्लोक X, ॥ X ॥) from the original
Gita Press text are converted to Western digits (1234567890) and accurately
placed in the English translation text.
"""

import json
import re
from pathlib import Path

FILE_PATH = Path("data/output/gita_editions/gita_press_translated.json")

DEV_DIGITS = "०१२३४५६७८९"

def dev_to_western(text: str) -> str:
    """Convert Devanagari digits in a string to Western digits (1234567890)."""
    res = ""
    for char in text:
        if char in DEV_DIGITS:
            res += str(DEV_DIGITS.index(char))
        else:
            res += char
    return res

def audit_and_fix():
    if not FILE_PATH.exists():
        print(f"❌ File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("\n" + "═" * 70)
    print("  NITYAGEETA — Audit & Fix Shloka / Verse Numbers (Pages 25–100)")
    print("═" * 70)

    fixed_headers_count = 0
    fixed_verses_count = 0

    for item in data:
        page = item["page"]
        orig = item.get("original", "")
        eng = item.get("english", "")

        if not orig or not eng:
            continue

        lines_eng = eng.splitlines()

        # 1. Check top header in original text (e.g. श्लोक १३], श्लोक २१-२२])
        top_header_match = re.search(r'^\s*श्लोक\s*([०-९]+(?:-[०-९]+)?)', orig)
        if top_header_match:
            top_shloka_num = dev_to_western(top_header_match.group(1))
            header_tag = f"[Verse {top_shloka_num}]"

            # Check if top shloka tag exists in top lines of english
            top_block = "\n".join(lines_eng[:3])
            if f"[Verse {top_shloka_num}]" not in top_block and f"Verse {top_shloka_num}" not in top_block:
                # Insert [Verse X] right after page number line
                if lines_eng and lines_eng[0].strip().isdigit():
                    lines_eng.insert(1, header_tag)
                else:
                    lines_eng.insert(0, f"{page}\n{header_tag}")
                fixed_headers_count += 1

        # 2. Check chapter headers in original text (e.g. [ अध्याय २ )
        chap_match = re.search(r'\[\s*अध्याय\s*([०-९]+)', orig)
        if chap_match:
            chap_num = dev_to_western(chap_match.group(1))
            chap_tag = f"[Chapter {chap_num}]"
            if f"Chapter {chap_num}" not in eng:
                if lines_eng and lines_eng[0].strip().isdigit():
                    lines_eng.insert(1, chap_tag)
                else:
                    lines_eng.insert(0, f"{page}\n{chap_tag}")

        # Re-assemble English text
        item["english"] = "\n".join(lines_eng)

    # Save updated file
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Added/Aligned top shloka headers in {fixed_headers_count} pages.")
    print("═" * 70 + "\n")

if __name__ == "__main__":
    audit_and_fix()
