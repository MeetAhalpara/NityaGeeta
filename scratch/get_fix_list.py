import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

pages_to_fix = []

for item in data:
    page = item['page']
    orig = item.get('original', '').strip()
    eng = item.get('english', '').strip()
    
    if not eng or '[Decorative' in eng:
        continue

    last_char = eng[-1]
    is_index_page = (page >= 1264 and page <= 1296)
    
    abrupt = False
    if last_char not in '.!?)"\'*—\u0964' and not eng.endswith('etc.') and not eng.endswith('||') and not eng.endswith('॥'):
        if not (is_index_page and (last_char.isdigit() or last_char in ['-', ';', ','])):
            abrupt = True

    ratio = len(eng) / max(len(orig), 1)
    too_short = (len(orig) > 1500 and ratio < 0.35)
    
    # Check for repeated glitching lines like "= Thus,\n- Thus," or "= become"
    has_glitch = bool(re.search(r'(?:=\s*\w+\n){3,}', eng))
    
    if abrupt or too_short or has_glitch:
        pages_to_fix.append(page)

print(f"Total pages needing re-translation/fixing: {len(pages_to_fix)}")
print("Page numbers:", pages_to_fix)
