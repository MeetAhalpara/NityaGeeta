import re

with open("frontend/src/data/gitaDilemmas.ts", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(
    r'id:\s*"(?P<id>[^"]+)",\s*'
    r'chapter:\s*(?P<chapter>\d+),\s*'
    r'verse:\s*(?P<verse>\d+),\s*'
    r'category:\s*"(?P<category>[^"]+)",\s*'
    r'categoryLabel:\s*"(?P<categoryLabel>[^"]+)",\s*'
    r'title:\s*"(?P<title>[^"]+)",\s*'
    r'situation:\s*"(?P<situation>[^"]+)",\s*'
    r'verseCitation:\s*"(?P<verseCitation>[^"]+)",\s*'
    r'verseSanskrit:\s*"(?P<verseSanskrit>[^"]+)",\s*'
    r'verseTransliteration:\s*"(?P<verseTransliteration>[^"]+)",\s*'
    r'coreInsight:\s*"(?P<coreInsight>[^"]+)",\s*'
    r'commentarySource:\s*"(?P<commentarySource>[^"]+)",\s*'
    r'promptQuery:\s*"(?P<promptQuery>[^"]+)",\s*'
    r'tag:\s*"(?P<tag>[^"]+)"',
    re.MULTILINE
)

dilemmas = [m.groupdict() for m in pattern.finditer(content)]

# Find work-2-47 and ethics-1-30
for d in dilemmas:
    if d['id'] in ('work-2-47', 'ethics-1-30'):
        print(f"\nID: {d['id']}")
        print(f"Title: {d['title']}")
        print(f"Situation: {d['situation']}")
        print(f"Prompt: {d['promptQuery']}")
        print(f"Tag: {d['tag']}")
