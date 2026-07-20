import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

chapter_pages = {}

hindi_digits_map = str.maketrans('०१२३४५६७८९', '0123456789')
def to_asc(text):
    return text.translate(hindi_digits_map)

for item in data:
    page = item['page']
    orig = to_asc(item.get('original', ''))
    
    # Check for main chapter start markers
    ch_matches = re.findall(r'(?:अथ\s*)?([0-9]+)\s*वां?\s*अध्याय|अध्याय\s*([0-9]+)', orig)
    for m in ch_matches:
        val = m[0] or m[1]
        if val.isdigit():
            ch_num = int(val)
            if 1 <= ch_num <= 18:
                if ch_num not in chapter_pages:
                    chapter_pages[ch_num] = []
                chapter_pages[ch_num].append(page)

print("Chapter occurrences found in original text:")
for ch in sorted(chapter_pages.keys()):
    print(f"  Chapter {ch}: First seen on page {min(chapter_pages[ch])} (Total occurrences: {len(chapter_pages[ch])})")

missing_ch = set(range(1, 19)) - set(chapter_pages.keys())
print(f"\nMissing chapters: {missing_ch}")
