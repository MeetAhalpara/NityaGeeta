import json
data = json.load(open('data/output/veducation_books/boss_ocr.json', encoding='utf-8'))
page_map = {item['page']: item.get('text','') for item in data}

sections = {
    "Soul (12-24)": range(12, 25),
    "God/Vishnu (25-45)": range(25, 46),
    "Demigods (46-63)": range(46, 64),
    "Nature (64-75)": range(64, 76),
    "Dharma (102-131)": range(102, 132),
    "Karma (132-145)": range(132, 146),
    "Q&A sample (252-262)": range(252, 263),
}

for section, pages in sections.items():
    print(f"\n{'='*60}")
    print(f"SECTION: {section}")
    print('='*60)
    for p in pages:
        if p in page_map and page_map[p].strip():
            print(f"\n--- Page {p} ---")
            print(page_map[p][:500])
