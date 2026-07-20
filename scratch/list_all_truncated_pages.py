import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

truncated_pages = []

for item in data:
    page = item['page']
    orig = item.get('original', '').strip()
    eng = item.get('english', '').strip()
    
    if not eng or '[Decorative' in eng:
        continue

    last_char = eng[-1]
    
    # Check if eng ends without sentence-closing punctuation
    # Allow ending with numbers if it's an index line or citation
    is_index_page = (page >= 1264 and page <= 1296)
    
    abrupt = False
    if last_char not in '.!?)"\'*—\u0964' and not eng.endswith('etc.') and not eng.endswith('||') and not eng.endswith('॥'):
        if not (is_index_page and (last_char.isdigit() or last_char == '-')):
            abrupt = True

    # Check for suspiciously short translation relative to original text length
    ratio = len(eng) / max(len(orig), 1)
    too_short = (len(orig) > 1500 and ratio < 0.35)
    
    if abrupt or too_short:
        truncated_pages.append({
            'page': page,
            'orig_len': len(orig),
            'eng_len': len(eng),
            'ratio': round(ratio, 2),
            'abrupt': abrupt,
            'too_short': too_short,
            'last_char': repr(last_char),
            'end_snippet': repr(eng[-60:])
        })

print(f"Total pages flagged as truncated or incomplete: {len(truncated_pages)}")
for tp in truncated_pages:
    print(f"Page {tp['page']:4d} | abrupt={tp['abrupt']!s:5s} | too_short={tp['too_short']!s:5s} | ratio={tp['ratio']:.2f} | end={tp['end_snippet']}")
