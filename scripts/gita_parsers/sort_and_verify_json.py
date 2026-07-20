import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

TRANS_OUTPUT = "./data/output/gita_editions/gita_press_translated.json"

def sort_and_dedup():
    if not Path(TRANS_OUTPUT).exists():
        print(f"❌ File not found: {TRANS_OUTPUT}")
        return

    with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Original items count: {len(data)}")

    # Deduplicate keeping the LAST instance of each page number (most recent translation)
    page_map = {}
    for item in data:
        page_num = item["page"]
        page_map[page_num] = item

    # Sort strictly by page number
    sorted_pages = sorted(page_map.keys())
    sorted_data = [page_map[p] for p in sorted_pages]

    with open(TRANS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Deduplicated and sorted {len(sorted_data)} pages strictly sequentially!")
    print(f"Page range: {min(sorted_pages)} → {max(sorted_pages)}")
    print(f"Last page in JSON: {max(sorted_pages)}")

if __name__ == "__main__":
    sort_and_dedup()
