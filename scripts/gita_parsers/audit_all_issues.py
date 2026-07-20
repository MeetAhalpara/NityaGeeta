import json, re, sys
from pathlib import Path

TRANS_OUTPUT = "./data/output/gita_editions/gita_press_translated.json"
ORIGINAL_JSON = "./data/output/gita_editions/Srimad Bhagavad Gita Press Gorakhpur.json"

def audit_all():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
        trans_data = json.load(f)

    with open(ORIGINAL_JSON, "r", encoding="utf-8") as f:
        orig_data = json.load(f)

    orig_map = {d["page"]: d for d in orig_data}
    t_map = {d["page"]: d for d in trans_data}

    print("=" * 70)
    print("  COMPREHENSIVE AUDIT OF GITA PRESS TRANSLATION")
    print("=" * 70)

    invalid_verses = []
    page_num_in_text = []
    repetitive_text = []
    empty_verse_tags = []

    for item in trans_data:
        p = item["page"]
        eng = item.get("english", "")
        orig_t = orig_map.get(p, {}).get("text", "")

        # 1. Check for invalid high verse numbers (> 78) in English translation
        # Matches patterns like "Verse 531", "Verse 551", "564/56", "Chapter X, Verse 531"
        v_matches = re.findall(r"(?:Verse|Shloka|\bV\.?|\bSh\.?)\s*(\d{2,4})", eng, re.IGNORECASE)
        for v in v_matches:
            v_num = int(v)
            if v_num > 78 and v_num != p: # exclude page number references if distinct
                invalid_verses.append((p, f"Verse number {v_num} > 78"))

        # 2. Check for page numbers hallucinated inside verse numbers (e.g. 564/56, 531.1)
        p_matches = re.findall(rf"\b({p}/\d+|\d+/{p}|{p}\.\d+)\b", eng)
        if p_matches:
            page_num_in_text.append((p, f"Page number hallucinated in text: {p_matches}"))

        # 3. Check for repetitive identical sentences in English text (hallucination indicator)
        sentences = [s.strip() for s in re.split(r"[.\n]", eng) if len(s.strip()) > 30]
        counts = {}
        for s in sentences:
            counts[s] = counts.get(s, 0) + 1
        repetitive = [s for s, c in counts.items() if c >= 3]
        if repetitive:
            repetitive_text.append((p, f"Repetitive text detected ({len(repetitive)} sentences repeated 3+ times)"))

        # 4. Check for empty verse tags like "[Verse 17]\n[Verse 18]"
        empty_tags = re.findall(r"\[\s*Verse\s*\d+\s*\]\s*(?=\[\s*Verse\s*\d+\s*\]|\Z)", eng, re.IGNORECASE)
        if empty_tags:
            empty_verse_tags.append((p, f"Empty verse tags: {empty_tags}"))

    print(f"\n1. Invalid Verse Numbers (>78): {len(invalid_verses)} pages")
    for p, msg in invalid_verses[:15]:
        print(f"   Page {p}: {msg}")

    print(f"\n2. Page Numbers Hallucinated in Text: {len(page_num_in_text)} pages")
    for p, msg in page_num_in_text[:15]:
        print(f"   Page {p}: {msg}")

    print(f"\n3. Repetitive/Hallucinated Sentences: {len(repetitive_text)} pages")
    for p, msg in repetitive_text[:15]:
        print(f"   Page {p}: {msg}")

    print(f"\n4. Empty Verse Tags: {len(empty_verse_tags)} pages")
    for p, msg in empty_verse_tags[:15]:
        print(f"   Page {p}: {msg}")

if __name__ == "__main__":
    audit_all()
