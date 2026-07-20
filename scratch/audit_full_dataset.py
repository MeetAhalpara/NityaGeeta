import json
import re

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} pages from JSON.")

issues = []

# Regex patterns for Hindi/English numbers and verse/chapter citations
hindi_digits_map = str.maketrans('०१२३४५६७८९', '0123456789')

def to_asc(text):
    return text.translate(hindi_digits_map)

# Extract shloka pattern like ॥ २ । ४५ ॥ or श्लोक १५ or verse 15 or (16.1)
shloka_pattern_hi = re.compile(r'॥\s*([०-९\d]+)\s*॥|श्लोक\s*([०-९\d]+)|अध्याय\s*([०-९\d]+)')
shloka_pattern_en = re.compile(r'॥\s*(\d+)\s*॥|Shloka\s*(\d+)|Verse\s*(\d+)|Chapter\s*(\d+)', re.IGNORECASE)

empty_pages = []
mismatched_citations = []
short_translations = []

for item in data:
    page = item.get('page')
    orig = item.get('original', '')
    eng = item.get('english', '')
    
    if not orig.strip() or not eng.strip():
        empty_pages.append(page)
        continue
        
    orig_asc = to_asc(orig)
    eng_asc = to_asc(eng)
    
    # Check length ratio (if translation is suspiciously short compared to original)
    if len(orig) > 200 and len(eng) < len(orig) * 0.25 and '[Decorative' not in eng:
        short_translations.append((page, len(orig), len(eng)))

    # Check Adhyay/Chapter occurrences in Hindi vs English
    hi_adhyays = re.findall(r'अध्याय\s*([0-9]+)', orig_asc)
    en_chapters = re.findall(r'(?:Chapter|Adhyay|Adhyaya)\s*([0-9]+)', eng_asc, re.IGNORECASE)
    
    if set(hi_adhyays) != set(en_chapters):
        # Only report if there's actual chapter heading mismatch
        if hi_adhyays or en_chapters:
            mismatched_citations.append({
                'page': page,
                'type': 'Chapter mismatch',
                'hindi_adhyays': hi_adhyays,
                'english_chapters': en_chapters
            })

    # Check double bar shloka numbers like ॥ १५ ॥ or || 15 ||
    hi_shlokas = re.findall(r'॥\s*([0-9]+)\s*॥', orig_asc)
    en_shlokas = re.findall(r'(?:॥|\|\||\*\*)\s*([0-9]+)\s*(?:॥|\|\||\*\*)', eng_asc)
    # also check plain numbers after verse/shloka in english
    en_shlokas_alt = re.findall(r'(?:verse|shloka|sloka)\s*([0-9]+)', eng_asc, re.IGNORECASE)
    
    all_en_shlokas = list(set(en_shlokas + en_shlokas_alt))
    
    if set(hi_shlokas) and not set(hi_shlokas).issubset(set(all_en_shlokas)):
        # Check if missing shloka number in English
        diff = set(hi_shlokas) - set(all_en_shlokas)
        # Verify if number exists in text anywhere in english
        truly_missing = [num for num in diff if num not in eng_asc]
        if truly_missing:
            mismatched_citations.append({
                'page': page,
                'type': 'Missing shloka number in English',
                'hi_shlokas': hi_shlokas,
                'en_shlokas': all_en_shlokas,
                'missing': truly_missing
            })

print(f"\n--- AUDIT RESULTS ---")
print(f"Empty pages: {len(empty_pages)} -> {empty_pages}")
print(f"Suspiciously short translations: {len(short_translations)}")
for p, l_orig, l_eng in short_translations[:10]:
    print(f"  Page {p}: orig len {l_orig}, eng len {l_eng}")

print(f"Citation / Number Mismatches: {len(mismatched_citations)}")
for m in mismatched_citations[:20]:
    print(f"  Page {m['page']} ({m['type']}): {m}")
