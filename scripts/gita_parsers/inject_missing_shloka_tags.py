"""
scripts/gita_parsers/inject_missing_shloka_tags.py
NityaGeeta — Precision Shloka / Verse Number Synchronization (Pages 25 to 100)

Ensures every shloka / verse number in Devanagari (e.g. ॥ १५ ॥, श्लोक १३)
is accurately matched and formatted as Western digits [Verse 15], [Verse 13]
in the English translation.
"""

import json
import re
from pathlib import Path

FILE_PATH = Path("data/output/gita_editions/gita_press_translated.json")
DEV_DIGITS = "०१२३४५६७८९"

def dev_to_western(text: str) -> str:
    res = ""
    for char in str(text):
        if char in DEV_DIGITS:
            res += str(DEV_DIGITS.index(char))
        else:
            res += char
    return res

def sync_all_shlokas():
    if not FILE_PATH.exists():
        print(f"❌ File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("\n" + "═" * 70)
    print("  NITYAGEETA — Precision Shloka Tag Synchronization")
    print("═" * 70)

    total_tags_added = 0
    total_false_removed = 0

    for item in data:
        page = item["page"]
        orig = item.get("original", "")
        eng = item.get("english", "")

        if not orig or not eng:
            continue

        lines = eng.splitlines()
        modified = False

        # Check if page top in orig is just a running header like "श्लोक १६ ] * साधक - संजीवनी *"
        is_running_header = bool(re.search(r'श्लोक\s*[०-९]+(?:\s*\])?\s*\*?\s*साधक\s*-\s*संजीवनी', orig[:150]))
        has_real_verse_end = bool(re.search(r'॥\s*[०-९]+\s*॥', orig))

        # 0. Clean up false top [Verse X] tags added by previous runs on continuation pages
        if is_running_header and not has_real_verse_end:
            # Check top 3 lines for [Verse X]
            new_lines = []
            removed = False
            for idx, line in enumerate(lines[:3]):
                if re.match(r'^\s*\[Verse\s+\d+\]\s*$', line.strip()):
                    removed = True
                    total_false_removed += 1
                    modified = True
                    continue
                new_lines.append(line)
            if removed:
                lines = new_lines + lines[3:]

        # 1. Ensure top header shloka tag [Verse X] is at top ONLY if it's not a running header continuation
        if not is_running_header or has_real_verse_end:
            top_match = re.search(r'^\s*श्लोक\s*([०-९]+(?:-[०-९]+)?|[०-९]+(?:-[०-९]+)?)', orig)
            if not top_match:
                top_match = re.search(r'श्लोक\s*([०-९]+(?:-[०-९]+)?)', orig[:100])

            if top_match:
                v_num = dev_to_western(top_match.group(1))
                top_tag = f"[Verse {v_num}]"
                top_block = "\n".join(lines[:3])
                if top_tag not in top_block and f"Verse {v_num}" not in top_block:
                    if lines and lines[0].strip().isdigit():
                        lines.insert(1, top_tag)
                    else:
                        lines.insert(0, f"{page}\n{top_tag}")
                    total_tags_added += 1
                    modified = True

        # 2. Check mid-page shloka verse markers ॥ X ॥
        verse_matches = [dev_to_western(m) for m in re.findall(r'॥\s*([०-९]+)\s*॥', orig)]
        for v in verse_matches:
            tag = f"[Verse {v}]"
            pattern_check = [f"[Verse {v}]", f"Verse {v}", f"verse {v}", f"{v}.", f"{v}||", f"Verse {v}:"]
            
            # Check if verse number already exists in English
            current_eng_str = "\n".join(lines)
            if not any(p in current_eng_str for p in pattern_check):
                inserted = False
                for idx, line in enumerate(lines):
                    if any(kw in line.lower() for kw in ["connection -", "explanation -", "commentary -", "o son of", "he who", "nainam", "ubhayor", "anasin"]):
                        lines.insert(idx, tag)
                        inserted = True
                        total_tags_added += 1
                        modified = True
                        break
                if not inserted:
                    lines.append(tag)
                    total_tags_added += 1
                    modified = True

        if modified:
            item["english"] = "\n".join(lines)

    # Save dataset
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Synchronized tags: {total_tags_added} added, {total_false_removed} false header tags removed.")
    print("═" * 70 + "\n")

if __name__ == "__main__":
    sync_all_shlokas()
