import json
import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

hindi_digits_map = str.maketrans('०१२३४५६७८९', '0123456789')
def to_asc(text):
    return text.translate(hindi_digits_map)

shloka_pages = []
for item in data:
    page = item['page']
    orig = item.get('original', '')
    eng = item.get('english', '')
    
    orig_asc = to_asc(orig)
    eng_asc = to_asc(eng)
    
    # Check for verse markers like ॥ १ ॥
    hi_matches = re.findall(r'॥\s*(\d+)\s*॥', orig_asc)
    
    if hi_matches:
        missing_numbers = []
        for num in hi_matches:
            pattern = rf'(?:\b|\|\||\*|\bverse\s*|\bshloka\s*){num}(?:\b|\|\||\*|\.)'
            if not re.search(pattern, eng_asc, re.IGNORECASE) and num not in eng_asc:
                missing_numbers.append(num)
        
        if missing_numbers:
            shloka_pages.append({
                'page': page,
                'hi_shlokas': hi_matches,
                'missing_in_eng': missing_numbers,
                'orig_snippet': orig[:150].replace('\n', ' '),
                'eng_snippet': eng[:150].replace('\n', ' ')
            })

print(f"Total pages with main shloka verse markers (॥ N ॥): {sum(1 for d in data if re.search(r'॥\s*[०-९\d]+\s*॥', d.get('original','')))}")
print(f"Pages with potential missing shloka numbers in English: {len(shloka_pages)}")

for sp in shloka_pages[:30]:
    print(f"\nPage {sp['page']}: Hindi shlokas = {sp['hi_shlokas']}, Missing in EN = {sp['missing_in_eng']}")
    print(f"  HI: {sp['orig_snippet']}")
    print(f"  EN: {sp['eng_snippet']}")
