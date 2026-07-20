import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

page_map = {x['page']: x for x in data}

for p in [1, 2, 5, 8, 9, 10, 11, 15, 238, 1121, 1063]:
    item = page_map[p]
    eng = item.get('english', '').strip()
    last_char = eng[-1] if eng else ''
    print(f"=== PAGE {p} ===")
    print(f"last_char: {repr(last_char)} (ord {ord(last_char) if last_char else 0})")
    print("END SNIPPET:", repr(eng[-100:]))
