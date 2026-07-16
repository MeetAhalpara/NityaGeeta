"""
scripts/gita_parsers/audit_top_text_and_headers.py
Audit Gita Press translations (pages 25-100) for:
1. Missing page number at line 1 of English translation.
2. Missing top commentary text (e.g., jumping straight to 'Chapter X, Verse Y' when original text starts with commentary before the shloka).
"""

import json
import re

TRANS_FILE = "data/output/gita_editions/gita_press_translated.json"

def audit():
    with open(TRANS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    data.sort(key=lambda x: x["page"])

    missing_page_header = []
    skipped_top_commentary = []

    for item in data:
        page = item["page"]
        orig = item["original"].strip()
        eng = item["english"].strip()

        # Check 1: Does English start with the page number?
        first_line = eng.split('\n')[0].strip()
        if not re.match(rf"^{page}\b", first_line):
            missing_page_header.append((page, first_line[:40]))

        # Check 2: Does original start with commentary/text before a verse?
        # A verse in original is usually denoted by [ अध्याय ... ] or श्लोक ... or shloka text like || १ ||
        # If original text has text before the first श्लोक / Verse, but English starts immediately with 'Chapter' or 'Verse'
        lines_orig = [l.strip() for l in orig.split('\n') if l.strip()]
        
        # Check top 5 lines of original for commentary words (like व्याख्या, सम्बंध, या text without shloka)
        has_top_commentary_in_orig = False
        for l in lines_orig[1:6]:  # after page number line
            if not l.startswith("[ अध्याय") and not l.startswith("श्लोक") and not "॥" in l and len(l) > 15:
                has_top_commentary_in_orig = True
                break

        if has_top_commentary_in_orig and (eng.startswith("Chapter") or eng.startswith("Verse") or eng.startswith("Shloka")):
            skipped_top_commentary.append(page)

    print("══════════════════════════════════════════════════════════════════════")
    print(f"  AUDIT RESULTS (Pages 25 to 100 — {len(data)} pages total)")
    print("══════════════════════════════════════════════════════════════════════")
    
    print(f"\n1. Pages missing Page Number at Line 1 of English: {len(missing_page_header)}")
    for p, fl in missing_page_header[:15]:
        print(f"   - Page {p:3d}: Starts with '{fl}'")
    if len(missing_page_header) > 15:
        print(f"   ... and {len(missing_page_header)-15} more.")

    print(f"\n2. Pages where Top Commentary was SKIPPED (jumped straight to Chapter/Verse): {len(skipped_top_commentary)}")
    print(f"   Pages: {skipped_top_commentary}")

if __name__ == "__main__":
    audit()
