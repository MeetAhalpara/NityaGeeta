import re
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

TRANS_OUTPUT = "./data/output/gita_editions/gita_press_translated.json"

def audit_and_fix_all_pages():
    print("═" * 70)
    print("  AUDITING & CLEANING ALL EXISTING TRANSLATED PAGES")
    print("═" * 70)

    if not Path(TRANS_OUTPUT).exists():
        print(f"❌ File not found: {TRANS_OUTPUT}")
        return

    with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
        data = json.load(f)

    fixed_count = 0
    shloka_added_count = 0
    chapter_added_count = 0
    stray_numbers_removed = 0

    devanagari_nums = {'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'}
    def convert_dev_num(text):
        for k, v in devanagari_nums.items():
            text = text.replace(k, v)
        return text

    for item in data:
        page_num = item["page"]
        orig = item.get("original", "")
        eng = item.get("english", "")

        if not eng or len(eng.strip()) < 10:
            continue

        orig_clean = eng.strip()
        lines = orig_clean.split("\n")

        # 1. Clean stray 2-digit numbers after page number header (e.g., 531 \n\n 53 -> 531)
        # also 564/56 -> 564
        eng_fixed = re.sub(r'^\s*(' + str(page_num) + r')\s*\n+(?:\d{1,2}|' + str(page_num) + r'/\d{1,2}|1\.\s*\d{1,2})\s*\n+', r'\1\n\n', eng_fixed if 'eng_fixed' in locals() else eng)
        eng_fixed = re.sub(r'^\s*(' + str(page_num) + r')\s*\n+1\.\s*(' + str(page_num)[:2] + r'|\d{1,2})\s*\n+', r'\1\n\n', eng_fixed)

        # 2. Check for missing Shloka Banner: श्लोक XX ] -> [Verse XX]
        shloka_match = re.search(r'श्लोक\s*([०-९\d]+)\s*\]', orig)
        if shloka_match:
            v_num = convert_dev_num(shloka_match.group(1)).strip()
            # If [Verse v_num] or [Verse v_num] not in eng_fixed
            if not re.search(rf'\[\s*(?:Verse|Shloka)\s*{v_num}\s*\]', eng_fixed, re.IGNORECASE):
                # Insert [Verse v_num] after page header line
                lines_fixed = eng_fixed.split("\n")
                if len(lines_fixed) > 0 and lines_fixed[0].strip() == str(page_num):
                    lines_fixed.insert(1, f"[Verse {v_num}]\n")
                    eng_fixed = "\n".join(lines_fixed)
                    shloka_added_count += 1

        # 3. Check for missing Chapter Banner: [ अध्याय X ] or अध्याय X -> [ Chapter X ]
        ch_match = re.search(r'\[\s*अध्याय\s*([०-९\d]+)', orig)
        if ch_match:
            c_num = convert_dev_num(ch_match.group(1)).strip()
            if not re.search(rf'\[\s*Chapter\s*{c_num}\s*\]', eng_fixed, re.IGNORECASE):
                # Insert [ Chapter c_num ] if header is near top of original
                if "[ अध्याय" in orig[:200] or "अध्याय" in orig[:200]:
                    lines_fixed = eng_fixed.split("\n")
                    if len(lines_fixed) > 0 and lines_fixed[0].strip() == str(page_num):
                        lines_fixed.insert(1, f"* Srimad Bhagavad Gita *\n[ Chapter {c_num} ]")
                        eng_fixed = "\n".join(lines_fixed)
                        chapter_added_count += 1

        if eng_fixed != eng:
            item["english"] = eng_fixed
            fixed_count += 1

    with open(TRANS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✓ Audited {len(data)} pages.")
    print(f"✓ Fixed formatting / header defects in {fixed_count} pages.")
    print(f"✓ Synchronized {shloka_added_count} missing [Verse X] banners.")
    print(f"✓ Synchronized {chapter_added_count} missing [Chapter X] banners.")
    print("═" * 70)

if __name__ == "__main__":
    audit_and_fix_all_pages()
