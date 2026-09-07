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

STOP_WORDS = set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about",
    "of", "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "i", "me", "my", "myself", "we", "our", "you", "your", "he", "him",
    "she", "her", "it", "its", "they", "them", "what", "which", "who", "whom", "this", "that",
    "these", "those", "from", "as", "by", "into", "through", "during", "before", "after",
    "above", "below", "up", "down", "out", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
    "tell", "show", "find", "looking", "look", "want", "would", "like", "give", "please",
    "help", "helps", "need", "needs", "feel", "feeling", "dilemma", "dilemmas", "situation",
    "shloka", "verse", "verses", "chapter", "content", "contents", "contain", "contains",
    "knowledge", "provide", "provides", "learn", "learning", "understand",
    "understands", "understanding", "explain", "explains", "guidance", "guide",
    # Added critical conversational fillers
    "one", "ones", "someone", "anyone", "everyone", "person", "people", "getting", "got", "getting"
])

TYPO_MAP = {
    "burn": "burnout",
    "burnt": "burnout",
    "burned": "burnout",
    "exhausted": "exhaustion",
    "exaustion": "exhaustion",
    "overworked": "burnout"
}

SEMANTIC_SYNONYMS = {
    "burnout": ["exhaustion", "overworked", "fatigue", "workaholic", "hustle", "overwhelmed", "burnt", "burned"],
    "grief": ["mourning", "bereavement", "sorrow", "heartbreak", "loss", "death", "dying"],
    "anxiety": ["panic", "fear", "worry", "nervous", "terror", "stress", "restless", "agitation", "anxious"],
    "depression": ["sadness", "despair", "hopeless", "collapse", "empty", "melancholy", "depressed"],
}

def search(raw_query):
    cleanQ = raw_query.replace("#", "").replace("@", "").lower().strip()
    preprocessedQ = cleanQ
    preprocessedQ = re.sub(r'\b(burnt|burned|burn)\s+out\b', 'burnout', preprocessedQ)
    preprocessedQ = re.sub(r'\bloved\s+ones?\b', 'loss', preprocessedQ)
    preprocessedQ = re.sub(r'\blosing\s+(a\s+)?(loved\s+one|someone|person)\b', 'grief loss', preprocessedQ)
    preprocessedQ = re.sub(r'\b(guide|guides|guidance)\s+(my\s+)?mind\b', 'guidance', preprocessedQ)

    rawTokens = re.split(r'[\s,+#_.:;?!/\\|()\[\]{}\'"]+', preprocessedQ)
    rawTokens = [t for t in rawTokens if t]
    meaningfulTokens = [TYPO_MAP.get(t, t) for t in rawTokens if t not in STOP_WORDS]
    tokensToUse = meaningfulTokens if meaningfulTokens else rawTokens

    scored = []
    for item in dilemmas:
        titleLower = item['title'].lower()
        situationLower = item['situation'].lower()
        insightLower = item['coreInsight'].lower()
        tagLower = item['tag'].lower()
        catLower = item['categoryLabel'].lower()
        promptLower = item['promptQuery'].lower()

        score = 0
        matchedCoreTokensCount = 0

        # Exact phrase matches
        if cleanQ in titleLower or preprocessedQ in titleLower:
            score += 250
            matchedCoreTokensCount += 1
            if titleLower.startswith(cleanQ) or titleLower.startswith(preprocessedQ) or f" {cleanQ} " in f" {titleLower} ":
                score += 60
        elif preprocessedQ in tagLower:
            score += 150
            matchedCoreTokensCount += 1
        elif preprocessedQ in situationLower:
            score += 100
            matchedCoreTokensCount += 1

        # Direct token scoring
        for token in tokensToUse:
            cleanToken = re.sub(r'[^a-z0-9]', '', token)
            if not cleanToken:
                continue

            tokenMatched = False

            # Exact token in title
            if cleanToken in titleLower.split() or f" {cleanToken} " in f" {titleLower} ":
                score += 120
                tokenMatched = True
            elif cleanToken in titleLower:
                score += 80
                tokenMatched = True

            if cleanToken in tagLower:
                score += 70
                tokenMatched = True

            if cleanToken in situationLower:
                score += 40
                tokenMatched = True

            if cleanToken in promptLower:
                score += 35
                tokenMatched = True

            # Semantic synonym matching (tight)
            for concept, syns in SEMANTIC_SYNONYMS.items():
                if cleanToken == concept or cleanToken in syns:
                    if concept in titleLower or any(s in titleLower for s in syns):
                        score += 60
                        tokenMatched = True
                    elif concept in situationLower or any(s in situationLower for s in syns):
                        score += 30
                        tokenMatched = True

            if tokenMatched:
                matchedCoreTokensCount += 1

        # Priority boost for Corporate Burnout (2.47) when query is burnout
        if "burnout" in cleanQ and item['id'] == 'work-2-47':
            score += 80

        # Topic relevance check for emotional queries like grief
        if "grief" in cleanQ:
            if "grief" in titleLower or "grieving" in titleLower:
                score += 160
            elif "grief" in situationLower or "grief" in promptLower or "grief" in insightLower:
                score += 90
            elif not any(w in titleLower or w in situationLower for w in ["death", "loss of", "bereavement", "mourning", "passed away"]):
                score = 0

        # Require meaningful match for multi-token query
        if len(tokensToUse) >= 2:
            if matchedCoreTokensCount >= 2:
                score += matchedCoreTokensCount * 60
            elif matchedCoreTokensCount == 0 and cleanQ not in titleLower:
                score = 0

        minThreshold = 65 if len(tokensToUse) >= 2 else 45
        if score >= minThreshold:
            scored.append((item, score))

    scored.sort(key=lambda x: (-x[1], int(x[0]['chapter']), int(x[0]['verse'])))
    return scored

queries = [
    "burnout",
    "grief and losing a loved one",
    "imposter syndrome",
    "restless wandering mind",
    "2.47",
    "18.66",
    "anger and rage",
    "fear of death and soul",
]

for q in queries:
    res = search(q)
    print(f"\nQuery: '{q}' -> {len(res)} matches")
    for item, s in res[:3]:
        print(f"   [{s}] Ch {item['chapter']}.{item['verse']} - {item['title']}")
