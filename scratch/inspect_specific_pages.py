import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

page_map = {x['page']: x for x in data}
check_pages = [238, 272, 1121, 1287]

for p in check_pages:
    item = page_map[p]
    print(f"=== PAGE {p} ===")
    print("ORIGINAL (first 200 chars):", repr(item['original'][:200]))
    print("ENGLISH (full/first 500 chars):", repr(item['english'][:500]))
    print("-" * 50)
