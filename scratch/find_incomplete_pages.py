import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

incomplete_pages = []

for item in data:
    page = item['page']
    orig = item.get('original', '').strip()
    eng = item.get('english', '').strip()
    
    if not eng or '[Decorative' in eng:
        continue

    # Check trailing punctuation or cut off sentences
    # Normal ending punctuation: . or ! or ? or ) or ] or " or '
    last_char = eng[-1] if eng else ''
    
    # Check if eng ends abruptly
    abrupt = False
    if last_char not in '.!?)"\'*—\u0964' and not eng.endswith('etc.'):
        abrupt = True
        
    # Check ratio
    ratio = len(eng) / max(len(orig), 1)
    
    if abrupt or ratio < 0.2:
        incomplete_pages.append({
            'page': page,
            'orig_len': len(orig),
            'eng_len': len(eng),
            'ratio': round(ratio, 2),
            'abrupt': abrupt,
            'last_50': repr(eng[-50:])
        })

print(f"Total potentially incomplete or abruptly cut off pages: {len(incomplete_pages)}")
for ip in incomplete_pages:
    print(ip)
