import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

page_map = {x['page']: x for x in data}
p1121 = page_map[1121]

print("=== PAGE 1121 ORIGINAL ===")
print(p1121['original'])
print("=== PAGE 1121 ENGLISH ===")
print(p1121['english'])
