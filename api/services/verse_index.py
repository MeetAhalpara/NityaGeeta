"""
verse_index.py — Verse-level search index for NityaGeeta.

Each verse entry stores:
  chapter, verse, citation, sanskrit, english,
  rich_text  ← translation + surrounding commentary (for wider matching)
  keywords   ← bag-of-words from rich_text
  source, page

search_verses(query, top_k):
  1. Expands query words via comprehensive synonym map
  2. Falls back to corpus-stem matching for unknown words
  3. Uses inverted index for fast lookup
  4. Returns top-k most relevant shlokas
"""

import re
import math
import logging
from collections import defaultdict
from typing import List, Dict, Any, Set, Tuple, Optional

logger = logging.getLogger("nityageeta.verse_index")

# ── Unicode helpers ───────────────────────────────────────────────────────────
_DEV_MAP = {"\u0966":"0","\u0967":"1","\u0968":"2","\u0969":"3","\u096a":"4",
            "\u096b":"5","\u096c":"6","\u096d":"7","\u096e":"8","\u096f":"9"}
def _dev(s): return "".join(_DEV_MAP.get(c,c) for c in s)

_VEND = "\u0965"   # ॥

STOP = {
    "the","a","an","is","in","of","to","and","or","for","with","on","at","by",
    "from","my","your","it","this","that","how","can","be","are","was","were",
    "has","have","had","not","do","does","did","but","so","if","as","he","she",
    "we","they","who","what","when","where","which","will","would","could",
    "should","may","might","one","its","his","her","their","our","all","any",
    "also","even","than","then","there","here","some","such","these","those",
    "only","very","just","more","most","no","up","out","into","about","after",
    "before","between","through","during","against","while","without","within",
    "toward","towards","upon","off","per","via","too","am","been","being","own",
    "same","again","further","once","both","few","now","don","nor","says","said",
    "say","thus","hence","therefore","yet","well","like","let","make","made",
    "man","men","person","people","way","ways","thing","things","time","times",
}

# ── Global state ──────────────────────────────────────────────────────────────
_VERSES: List[Dict[str,Any]] = []
_VERSE_MAP: Dict[str, Dict[str, Any]] = {}       # "chapter.verse" -> verse dict
_INV: Dict[str, List[int]] = defaultdict(list)   # word -> [verse indices]
_VOCAB: Set[str] = set()                         # all unique words in corpus
_DOC_LENS: List[int] = []                        # document lengths for BM25
_AVG_DOC_LEN: float = 0.0                        # average doc length
_IDF: Dict[str, float] = {}                      # Robertson-Spärck Jones IDF

# ── Deterministic Citation Parsing ────────────────────────────────────────────
def parse_verse_citation(text: str) -> Optional[Tuple[str, str]]:
    """
    Extracts (chapter, verse) tuple if the query explicitly cites a Gita shloka.
    Handles forms like:
      - 'BG 2.47', 'BG 2:47', 'BG 2-47'
      - 'Bhagavad Gita 18.66', 'Gita 18.66'
      - 'Chapter 2 Verse 47', 'Chapter 2, Verse 47'
      - '2.47 karma' or standalone '2.47'
    Returns (chapter_str, verse_str) or None.
    """
    if not text:
        return None

    # Pattern 1: Explicit BG / Gita / Chapter prefix (safe non-backtracking regex)
    explicit_pat = re.search(
        r'\b(?:bg|bhagavad\s+gita|gita|chapter|chap|ch)\.?\s*(\d{1,2})'
        r'(?:[.:\-,\s]+v\s*|[.:\-,\s]+|[.:\-,\s]*(?:verse|shloka|sloka)\s*)(\d{1,3})\b',
        text, re.IGNORECASE
    )
    if explicit_pat:
        ch, v = explicit_pat.group(1), explicit_pat.group(2)
        if 1 <= int(ch) <= 18 and 1 <= int(v) <= 78:
            return (str(int(ch)), str(int(v)))
        return None

    # Pattern 2: "Chapter X Verse Y"
    ch_v_pat = re.search(
        r'chapter\s*(\b\d{1,2}\b)\s*(?:,\s*)?(?:verse|shloka|sloka)\s*(\b\d{1,3}\b)',
        text, re.IGNORECASE
    )
    if ch_v_pat:
        ch, v = ch_v_pat.group(1), ch_v_pat.group(2)
        if 1 <= int(ch) <= 18 and 1 <= int(v) <= 78:
            return (str(int(ch)), str(int(v)))
        return None

    # Pattern 3: Standard numeric citation "X.Y" or "X:Y" (e.g., "2.47", "18:66")
    for m in re.finditer(r'\b(\d{1,2})\s*[\.\:]\s*(\d{1,3})\b', text):
        ch, v = m.group(1), m.group(2)
        if 1 <= int(ch) <= 18 and 1 <= int(v) <= 78:
            return (str(int(ch)), str(int(v)))

    return None

# ── Synonym map (covers every major Gita theme) ───────────────────────────────
SYN: Dict[str, List[str]] = {
    # Emotions
    "anger":["wrath","rage","passion","greed","lust","envy","hatred","desire"],
    "wrath":["anger","rage","passion","hatred","desire"],
    "greed":["desire","attachment","lust","craving","covet","avarice"],
    "lust":["desire","passion","greed","craving","attachment"],
    "jealousy":["envy","desire","covet","greed","attachment","hatred"],
    "envy":["jealousy","desire","covet","greed","hatred"],
    "hatred":["anger","wrath","desire","envy","enmity","compassion"],
    "fear":["fearless","anxiety","dread","terror","refuge","courage","protection"],
    "anxiety":["fear","worry","peace","steady","equanimity","calm","restless"],
    "worry":["anxiety","peace","equanimity","detachment","calm","distress"],
    "stress":["anxiety","worry","peace","equanimity","calm","burden","suffering"],
    "depression":["sorrow","grief","hopeless","despair","suffering","lament","despondency"],
    "despair":["hopeless","sorrow","grief","refuge","surrender","faith","hope"],
    "hopeless":["despair","refuge","surrender","faith","hope","despondency"],
    "grief":["sorrow","pain","mourn","lament","suffering","distress","lamentation"],
    "sorrow":["grief","pain","mourn","lament","suffering","distress"],
    "suffering":["pain","sorrow","grief","distress","affliction","misery","anguish"],
    "pain":["suffering","sorrow","grief","affliction","distress"],
    "sadness":["sorrow","grief","pain","mourn","lament","suffering"],
    "guilt":["sin","repentance","purification","atonement","wrong","deed"],
    "shame":["guilt","sin","dignity","honour","pride","ego"],
    "pride":["ego","arrogance","humility","surrender","vanity"],
    "ego":["pride","arrogance","humility","surrender","self","vanity","identity"],
    "arrogance":["pride","ego","humility","surrender","vanity","haughty"],
    "attachment":["desire","bondage","detachment","craving","love","release"],
    "detachment":["attachment","renunciation","equanimity","freedom","liberation"],
    # Confidence & strength
    "confidence":["self","strength","courage","fearless","steadfast","conquer","friend","firm"],
    "selfconfidence":["self","strength","courage","fearless","conquer","friend","steady"],
    "confident":["self","strength","courage","fearless","conquer","firm"],
    "courage":["fearless","strength","brave","bold","valour","steadfast","firm"],
    "strength":["courage","power","steadfast","firm","conquer","resolve","mighty"],
    "weak":["strength","courage","firm","resolve","overcome","rise","self"],
    "weakness":["strength","courage","firm","resolve","overcome","self"],
    "insecurity":["confidence","self","strength","courage","steadfast","refuge"],
    # Trust & faith
    "trust":["faith","sraddha","belief","devotion","surrender","refuge","steadfast","doubt"],
    "distrust":["doubt","suspicion","faith","belief","wavering","trust"],
    "faith":["trust","sraddha","devotion","belief","surrender","steadfast","conviction"],
    "doubt":["faith","wavering","steadfast","conviction","trust","belief"],
    "believe":["faith","devotion","trust","surrender","conviction","worship"],
    "belief":["faith","devotion","trust","conviction","steadfast"],
    # Loneliness & relationships
    "alone":["solitary","refuge","friend","support","shelter","self","forsaken"],
    "lonely":["alone","solitary","friend","refuge","desolate","isolation"],
    "loneliness":["alone","solitary","friend","refuge","isolation","desolate"],
    "abandon":["alone","refuge","forsaken","solitary","friend","support","shelter"],
    "abandoned":["alone","refuge","forsaken","solitary","friend","support","desolate"],
    "rejected":["alone","abandoned","refuge","forsaken","friend","acceptance"],
    "isolation":["alone","lonely","solitary","refuge","friend","desolate"],
    "family":["kin","relations","kula","relative","dear","loved","kinsmen"],
    "partner":["spouse","husband","wife","companion","friend","relationship","attachment"],
    "relationship":["friend","love","attachment","bondage","devotion","companion","partner"],
    "love":["devotion","attachment","dear","affection","bhakti","compassion"],
    "giving":["charity","dana","selfless","offering","sacrifice","yajna","expectation","return"],
    "granted":["expectation","fruit","reward","recognition","unappreciated","attachment","detachment"],
    "taken":["granted","expectation","unappreciated","attachment"],
    "business":["enterprise","undertaking","work","trade","occupation","venture","livelihood"],
    "terrified":["fear","dread","terror","anxiety","hesitation","courage","fearless"],
    "friendship":["friend","companion","dear","wisher","devotion"],
    "betrayal":["trust","faith","friend","duty","dharma","enemy","deceit"],
    "divorce":["family","duty","dharma","attachment","detachment","relations"],
    "breakup":["sorrow","grief","attachment","detachment","love","suffering"],
    "marriage":["duty","dharma","family","relations","devotion","companion"],
    # Duty, purpose & action
    "duty":["dharma","action","karma","responsibility","path","obligation"],
    "dharma":["duty","righteousness","action","karma","path","truth"],
    "purpose":["duty","dharma","action","karma","path","meaning","goal"],
    "meaning":["purpose","duty","dharma","karma","path","wisdom"],
    "direction":["duty","dharma","path","purpose","goal","guidance"],
    "action":["karma","duty","dharma","work","deed","effort","activity"],
    "karma":["action","duty","dharma","deed","work","fruit","result"],
    "work":["action","karma","duty","effort","labor","deed","activity"],
    "effort":["action","karma","work","perseverance","resolve","steadfast"],
    "laziness":["action","duty","effort","work","resolve","inertia","tamas"],
    "procrastination":["action","duty","effort","work","resolve","discipline"],
    "motivation":["action","duty","effort","karma","purpose","resolve","will"],
    "goal":["purpose","duty","dharma","action","karma","path","aim"],
    "success":["action","duty","karma","fruit","detachment","result","achieve"],
    "failure":["action","result","attachment","detachment","karma","rise","overcome"],
    "career":["duty","dharma","action","karma","work","effort","path"],
    "job":["duty","dharma","action","karma","work","effort","livelihood"],
    "exam":["action","duty","effort","karma","result","detachment","focus"],
    "competition":["action","duty","effort","karma","detachment","equanimity"],
    # Mind & wisdom
    "mind":["intellect","sense","thought","control","steady","consciousness","manas"],
    "intellect":["mind","wisdom","discernment","steady","buddhi","reason"],
    "wisdom":["knowledge","intellect","discernment","truth","enlightenment","jnana"],
    "knowledge":["wisdom","truth","understanding","enlightenment","jnana","learning"],
    "ignorance":["knowledge","wisdom","illusion","maya","darkness","avidya"],
    "confusion":["clarity","wisdom","knowledge","mind","steady","discernment"],
    "clarity":["wisdom","knowledge","intellect","steady","discernment"],
    "meditation":["mind","steady","contemplation","focus","yoga","dhyana","equanimity"],
    "focus":["mind","steady","meditation","attention","concentration","yoga"],
    "discipline":["self","control","steady","yoga","practice","resolve","sadhana"],
    "control":["self","discipline","mind","steady","conquer","restrain","sense"],
    "consciousness":["self","atman","awareness","soul","mind","witness","spirit"],
    # Peace & happiness
    "peace":["tranquil","equanimity","calm","serene","bliss","contentment","harmony"],
    "happiness":["joy","bliss","contentment","peace","delight","pleasure","wellbeing"],
    "joy":["happiness","bliss","contentment","delight","peace","ananda"],
    "bliss":["joy","happiness","ananda","contentment","peace","liberation"],
    "contentment":["peace","happiness","joy","satisfaction","equanimity","santosha"],
    "calm":["peace","equanimity","steady","serene","tranquil","stillness"],
    "balance":["equanimity","steady","harmony","peace","calm","yoga"],
    "equanimity":["balance","calm","peace","steady","detachment","even","yoga"],
    # Spiritual path
    "god":["divine","lord","krishna","brahman","atman","supreme","worship"],
    "prayer":["worship","devotion","bhakti","surrender","faith","divine"],
    "worship":["devotion","bhakti","prayer","surrender","faith","divine","lord"],
    "devotion":["bhakti","worship","love","surrender","faith","divine"],
    "bhakti":["devotion","worship","love","surrender","faith","divine"],
    "surrender":["refuge","devotion","faith","trust","accept","divine"],
    "liberation":["moksha","freedom","release","soul","atman","eternal","salvation"],
    "moksha":["liberation","freedom","release","eternal","salvation","soul"],
    "soul":["atman","self","spirit","eternal","consciousness","divine"],
    "atman":["soul","self","spirit","eternal","consciousness","brahman"],
    "yoga":["union","discipline","path","meditation","action","devotion","knowledge"],
    "enlightenment":["liberation","wisdom","knowledge","truth","moksha","realization"],
    # Death & impermanence
    "death":["eternal","soul","atman","immortal","perish","body","born","reborn"],
    "loss":["grief","impermanent","eternal","detachment","acceptance","sorrow"],
    "impermanence":["eternal","change","death","body","soul","illusion","maya"],
    "change":["impermanence","eternal","transformation","accept","adapt","steady"],
    # Practical life
    "money":["wealth","attachment","duty","karma","greed","desire","detachment"],
    "wealth":["money","attachment","duty","karma","greed","desire","prosperity"],
    "poverty":["wealth","money","duty","karma","detachment","contentment"],
    "health":["body","mind","discipline","yoga","self","care","well"],
    "illness":["suffering","body","mind","acceptance","duty","karma"],
    "addiction":["desire","attachment","greed","craving","control","liberation"],
    "habit":["action","karma","discipline","control","practice","change"],
    "decision":["wisdom","intellect","duty","dharma","discernment","action"],
    "choice":["wisdom","duty","dharma","discernment","action","free","will"],
    "regret":["past","action","karma","acceptance","wisdom","detachment"],
    "forgiveness":["compassion","acceptance","duty","love","release","let"],
    "injustice":["dharma","duty","righteousness","truth","action","stand","right"],
    "leadership":["duty","dharma","wisdom","action","karma","responsibility"],
    "student":["knowledge","learning","wisdom","duty","discipline","guru"],
    "education":["knowledge","learning","wisdom","duty","discipline","discernment"],
    "helpless":["refuge","surrender","faith","strength","courage","divine","action"],
    "lost":["direction","purpose","dharma","path","wisdom","guidance"],
    "stuck":["action","effort","resolve","karma","duty","overcome","forward"],
    "overwhelmed":["peace","calm","equanimity","steady","mind","surrender"],
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _tokenize(text: str) -> List[str]:
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [w for w in words if len(w) >= 3 and w not in STOP]


def _verse_num(text: str):
    """Returns (chapter, verse) strings from a Devanagari verse block."""
    m = re.search(
        r"\u0965\s*([\u0966-\u096f\d]+)\s*[.\u0964]?\s*([\u0966-\u096f\d]*)\s*\u0965",
        text
    )
    if not m:
        return None, None
    ch = _dev(m.group(1))
    v  = _dev(m.group(2)) if m.group(2) else ""
    return (ch, v) if v else (None, ch)


def _clean_sanskrit(text: str) -> str:
    lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        dev = len(re.findall(r"[\u0900-\u097f]", s))
        lat = len(re.findall(r"[a-zA-Z]", s))
        if dev == 0 and lat > 3:
            continue
        if re.fullmatch(r"[\d\s.\-|]+", s):
            continue
        lines.append(s)
    return "\n".join(lines).strip()


def _first_sentence(text: str) -> str:
    """Return text up to (and including) the first sentence-ending punctuation."""
    m = re.search(r"(?<=[a-z\d])[.!?]\s", text)
    if m and m.end() > 30:
        return text[:m.end()].strip()
    return text.strip()


# ── Extraction: P3 (Sadhak Sanjeevani — text field) ──────────────────────────

def _from_p3(pages: List[Dict]) -> List[Dict[str,Any]]:
    results = []
    ch_re = re.compile(r"\[?Chapter\s+(\d+)", re.I)

    for item in pages:
        txt  = str(item.get("text",""))
        page = item.get("page", 0)
        ch_m = ch_re.search(txt)
        inferred_ch = ch_m.group(1) if ch_m else ""

        for m in re.finditer(r"((?:[^\n]*[\u0900-\u097f][^\n]*\n?){1,6})", txt):
            blk = m.group(1)
            if _VEND not in blk: continue
            if len(re.findall(r"[\u0900-\u097f]", blk)) < 15: continue

            ch, v = _verse_num(blk)
            if not v: continue
            ch = ch or inferred_ch

            # ── Translation: first real English sentence after the verse ──
            after = txt[m.end(): m.end()+600]
            eng_lines, collecting = [], False
            for line in after.splitlines():
                s = line.strip()
                if not s:
                    if collecting: break
                    continue
                dev   = len(re.findall(r"[\u0900-\u097f]", s))
                iast  = len(re.findall(r"[āīūṛṁḥṭḍṇśṣñĀĪŪṚṂḤṬḌṆŚṢÑ]", s))
                lat   = len(re.findall(r"[a-zA-Z]", s))
                if dev == 0 and iast >= 2: continue
                if re.match(r"^\[?Verse\s*\d|^Comment", s, re.I): continue
                if not collecting and re.match(r"[A-Z]", s) and lat > 5:
                    collecting = True
                if collecting:
                    eng_lines.append(s)
                    if len(eng_lines) >= 4: break
                    if re.match(r"^\[?Verse\s*\d|^Comment|^\d+\s+[A-Z]", s, re.I):
                        eng_lines.pop(); break
            english = _first_sentence(" ".join(eng_lines))
            if len(english) < 20: continue

            # ── Rich text: translation + surrounding commentary (±800 chars) ──
            start = max(0, m.start()-400)
            end   = min(len(txt), m.end()+800)
            rich  = re.sub(r"[\u0900-\u097f]+", " ", txt[start:end])  # strip Devanagari
            rich  = re.sub(r"[āīūṛṁḥṭḍṇśṣñĀĪŪṚṂḤṬḌṆŚṢÑ\u0900-\u097f]", " ", rich)

            sanskrit = _clean_sanskrit(blk)
            if not sanskrit: continue

            results.append({
                "chapter": ch, "verse": v,
                "citation": f"Chapter {ch}, Verse {v}" if ch else f"Verse {v}",
                "sanskrit": sanskrit,
                "english":  english[:500],
                "rich_text": rich,
                "keywords": _tokenize(rich),
                "source": "Gita Sadhak Sanjeevani",
                "priority": 3,
                "page": page,
            })
    return results


# ── Extraction: P1 / P4 (original + english fields) ──────────────────────────

def _from_orig_eng(pages: List[Dict], source_name: str) -> List[Dict[str,Any]]:
    results = []
    ch_re = re.compile(r"\[?(?:Chapter|Chap\.?)\s+(\d+)", re.I)
    word_to_num = {
        "first": "1", "second": "2", "third": "3", "fourth": "4", "fifth": "5", "sixth": "6",
        "seventh": "7", "eighth": "8", "ninth": "9", "tenth": "10",
        "eleventh": "11", "twelfth": "12", "thirteenth": "13", "fourteenth": "14",
        "fifteenth": "15", "sixteenth": "16", "seventeenth": "17", "eighteenth": "18"
    }
    current_ch = "1"

    for item in pages:
        orig = str(item.get("original",""))
        eng  = str(item.get("english","") or item.get("text",""))
        page = item.get("page", 0)
        if _VEND not in orig:
            # Check if verse markers are in text/eng (e.g. Shankaracharya)
            if _VEND not in eng:
                continue
            orig = eng
        if len(re.findall(r"[\u0900-\u097f]", orig)) < 15:
            continue

        # Largest Devanagari block with verse marker
        best, best_len = None, 0
        for m in re.finditer(r"((?:[^\n]*[\u0900-\u097f][^\n]*\n?){1,6})", orig):
            blk = m.group(1)
            if _VEND not in blk: continue
            n = len(re.findall(r"[\u0900-\u097f]", blk))
            if n > best_len: best_len, best = n, blk

        if not best: continue
        ch, v = _verse_num(best)
        if not v: continue
        if not ch:
            cm = ch_re.search(eng)
            if cm:
                current_ch = cm.group(1)
            else:
                cm2 = re.search(r"(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|Thirteenth|Fourteenth|Fifteenth|Sixteenth|Seventeenth|Eighteenth)\s+Chapter", eng, re.I)
                if cm2:
                    w = cm2.group(0).split()[0].lower()
                    current_ch = word_to_num.get(w, current_ch)
            ch = current_ch

        # First real English sentence from the commentary
        english = ""
        for line in eng.splitlines():
            s = line.strip()
            if not s: continue
            if re.match(r"^#{1,3}\s|^\*\*|^Chapter|^Verse|^\d+\s*$", s, re.I): continue
            # Skip lines that are IAST transliteration (lots of diacritics)
            iast_count = len(re.findall(r"[āīūṛṁḥṭḍṇśṣñĀĪŪṚṂḤṬḌṆŚṢÑ]", s))
            if iast_count >= 4: continue
            # Skip lines starting with "Connection" or "Link" (structural labels)
            if re.match(r"^Connection\b|^Link\b|^Note\b", s, re.I): continue
            if re.match(r"[A-Z]", s) and len(s) > 25:
                english = _first_sentence(s[:600])
                break
        if len(english) < 15:
            english = eng[:300].strip()

        # Rich text = full english commentary page
        rich = re.sub(r"[āīūṛṁḥṭḍṇśṣñĀĪŪṚṂḤṬḌṆŚṢÑ\u0900-\u097f]", " ", eng)

        sanskrit = _clean_sanskrit(best)
        if not sanskrit: continue

        results.append({
            "chapter": str(int(ch)) if ch.isdigit() else ch,
            "verse": str(int(v)) if v.isdigit() else v,
            "citation": f"Chapter {ch}, Verse {v}" if ch else f"Verse {v}",
            "sanskrit": sanskrit,
            "english":  english[:500],
            "rich_text": rich,
            "keywords": _tokenize(rich),
            "source": source_name,
            "page": page,
        })
    return results

# ── Deduplication ─────────────────────────────────────────────────────────────

def _dedup(verses: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
    PRIO = {"Gita Sadhak Sanjeevani":1,"Gita Press Gorakhpur":2,"Adi Shankaracharya Commentary":3}
    seen: Dict[str,Dict] = {}
    for v in verses:
        key = f"{v['chapter']}.{v['verse']}"
        if key not in seen or PRIO.get(v.get("source"),9) < PRIO.get(seen[key].get("source"),9):
            seen[key] = v
    return list(seen.values())


# ── Build inverted index & BM25 structures ────────────────────────────────────

def _build_inverted(verses: List[Dict[str,Any]]) -> None:
    global _INV, _VOCAB, _DOC_LENS, _AVG_DOC_LEN, _IDF, _VERSE_MAP
    _INV = defaultdict(list)
    _VOCAB = set()
    _DOC_LENS = []
    _IDF = {}
    _VERSE_MAP = {}

    for idx, v in enumerate(verses):
        kw_list = v.get("keywords", [])
        kw_set = set(kw_list)
        _VOCAB.update(kw_set)
        _DOC_LENS.append(len(kw_list))
        for w in kw_set:
            _INV[w].append(idx)

        # Index canonical chapter.verse for O(1) deterministic retrieval
        ch = str(v.get("chapter", "")).strip()
        vs = str(v.get("verse", "")).strip()
        if ch and vs:
            ch_clean = str(int(ch)) if ch.isdigit() else ch
            vs_clean = str(int(vs)) if vs.isdigit() else vs
            _VERSE_MAP[f"{ch_clean}.{vs_clean}"] = v

    total_docs = len(verses)
    _AVG_DOC_LEN = float(sum(_DOC_LENS) / total_docs) if total_docs > 0 else 1.0

    # Precalculate Robertson-Spärck Jones IDF for all vocabulary terms
    for term, doc_indices in _INV.items():
        doc_freq = len(doc_indices)
        # Standard BM25 IDF with smoothing to prevent negative weights
        idf = math.log(((total_docs - doc_freq + 0.5) / (doc_freq + 0.5)) + 1.0)
        _IDF[term] = max(0.01, idf)


# ── BM25Okapi Ranking Engine ──────────────────────────────────────────────────

def bm25_score_verses(
    query_tokens: List[str],
    k1: float = 1.5,
    b: float = 0.75
) -> Dict[int, float]:
    """
    Computes BM25Okapi scores for all candidate verses with document length normalization.
    """
    scores: Dict[int, float] = defaultdict(float)
    if not _AVG_DOC_LEN or not _VERSES:
        return scores

    for word in query_tokens:
        idf = _IDF.get(word, 0.0)
        if idf <= 0.0:
            continue
        for idx in _INV.get(word, []):
            tf = _VERSES[idx]["keywords"].count(word)
            doc_len = _DOC_LENS[idx]
            norm_tf = (tf * (k1 + 1.0)) / (tf + k1 * (1.0 - b + b * (doc_len / _AVG_DOC_LEN)))
            scores[idx] += idf * norm_tf

    return scores


# ── Reciprocal Rank Fusion (RRF) ──────────────────────────────────────────────

def reciprocal_rank_fusion(
    ranked_lists: List[List[Tuple[int, float]]],
    k: int = 60
) -> List[Tuple[int, float]]:
    """
    Fuses multiple ranked lists using Reciprocal Rank Fusion:
      RRF_score(d) = sum_m 1 / (k + rank_m(d))
    k: constant damping factor (standard industry default: 60)
    """
    rrf_scores: Dict[int, float] = defaultdict(float)
    for r_list in ranked_lists:
        for rank_idx, (doc_idx, _) in enumerate(r_list, start=1):
            rrf_scores[doc_idx] += 1.0 / (k + rank_idx)

    return sorted(rrf_scores.items(), key=lambda x: -x[1])


# ── Public: build ─────────────────────────────────────────────────────────────

def build_verse_index(datasets: Dict[str, List[Dict]]) -> None:
    global _VERSES
    logger.info("Building verse index from loaded datasets...")

    p3 = _from_p3(datasets.get("p3_sadhak_sanjeevani_eng",[]))
    logger.info(f"  P3 (Sadhak Sanjeevani): {len(p3)} verses extracted")

    p1 = _from_orig_eng(datasets.get("p1_gita_press",[]), "Gita Press Gorakhpur")
    logger.info(f"  P1 (Gita Press):        {len(p1)} verses extracted")

    p4 = _from_orig_eng(datasets.get("p4_shankaracharya",[]), "Adi Shankaracharya Commentary")
    logger.info(f"  P4 (Shankaracharya):    {len(p4)} verses extracted")

    _VERSES = _dedup(p3 + p1 + p4)
    _build_inverted(_VERSES)
    logger.info(
        f"Verse index ready: {len(_VERSES)} unique shlokas | "
        f"vocab: {len(_VOCAB)} words | direct map: {len(_VERSE_MAP)} verses"
    )


# ── Public: search ────────────────────────────────────────────────────────────

def search_verses_hybrid(query: str, top_k: int = 3) -> List[Dict[str,Any]]:
    """
    Hybrid scripture search engine combining:
      1. Deterministic citation parser (e.g., 'BG 2.47', 'Chapter 18 Verse 66') -> O(1) exact hit.
      2. BM25Okapi lexical retrieval with doc-length normalization.
      3. Semantic/synonym-expanded inverted retrieval.
      4. Reciprocal Rank Fusion (RRF with k=60) merge layer.
    """
    if not _VERSES:
        return []

    # ── Path 1: Deterministic Verse Citation Fast-Path ─────────────────────────
    parsed_citation = parse_verse_citation(query)
    exact_verse = None
    if parsed_citation:
        ch, v = parsed_citation
        key = f"{int(ch)}.{int(v)}"
        if key in _VERSE_MAP:
            exact_verse = dict(_VERSE_MAP[key])
            exact_verse["retrieval_method"] = "deterministic_citation"
            exact_verse["rrf_score"] = 1.0
            exact_verse["bm25_score"] = 100.0
            exact_verse["confidence"] = 1.0
            logger.info(f"Deterministic citation match for '{query}': Chapter {ch}, Verse {v}")
            if top_k <= 1:
                return [exact_verse]

    # ── Path 2: Hybrid Retrieval (BM25 + Semantic Search + RRF) ───────────────
    # Tokenize query
    raw = _tokenize(query.replace("-",""))
    if not raw:
        raw = [w.lower() for w in query.split() if len(w) >= 3 and w not in STOP]

    primary:  List[str] = list(set(raw))
    expanded: List[str] = []
    for kw in primary:
        syns = SYN.get(kw, [])
        if not syns:
            for sk in SYN:
                if len(kw) >= 5 and (kw.startswith(sk[:5]) or sk.startswith(kw[:5])):
                    syns = SYN[sk]; break
        expanded.extend(syns)

    all_search = set(primary) | set(expanded)
    for kw in primary:
        if kw not in _VOCAB and len(kw) >= 4:
            stem = kw[:5]
            for vw in _VOCAB:
                if vw.startswith(stem) or stem.startswith(vw[:4]):
                    all_search.add(vw)

    if not all_search:
        return [exact_verse] if exact_verse else []

    # 1. BM25 scoring
    bm25_scores = bm25_score_verses(list(primary) + [e for e in expanded if e not in primary])
    ranked_bm25 = sorted(bm25_scores.items(), key=lambda x: -x[1])

    # 2. Semantic / Synonym scoring
    semantic_scores: Dict[int, float] = defaultdict(float)
    hits: Dict[int, Set[str]] = defaultdict(set)
    primary_set  = set(primary)
    expanded_set = set(expanded) - primary_set

    for word in all_search:
        for idx in _INV.get(word, []):
            kw_count = _VERSES[idx]["keywords"].count(word)
            src_boost = 1.2 if _VERSES[idx].get("source") == "Gita Sadhak Sanjeevani" else 1.0
            if word in primary_set:
                semantic_scores[idx] += kw_count * 6.0 * src_boost
            elif word in expanded_set:
                semantic_scores[idx] += kw_count * 1.0 * src_boost
            else:
                semantic_scores[idx] += kw_count * 0.3 * src_boost
            hits[idx].add(word)

    for idx in semantic_scores:
        if len(hits[idx]) >= 3:
            semantic_scores[idx] += 5.0

    ranked_semantic = sorted(semantic_scores.items(), key=lambda x: -x[1])

    # 3. Reciprocal Rank Fusion (RRF k=60)
    fused_ranks = reciprocal_rank_fusion([ranked_bm25[:50], ranked_semantic[:50]], k=60)

    results: List[Dict[str, Any]] = []
    seen_keys: Set[str] = set()

    # Prepend deterministic match if present
    if exact_verse:
        exact_key = f"{exact_verse['chapter']}.{exact_verse['verse']}"
        results.append(exact_verse)
        seen_keys.add(exact_key)

    for doc_idx, rrf_score in fused_ranks:
        v_entry = dict(_VERSES[doc_idx])
        key = f"{v_entry['chapter']}.{v_entry['verse']}"
        if key in seen_keys:
            continue
        v_entry["retrieval_method"] = "rrf_hybrid"
        v_entry["rrf_score"] = round(rrf_score, 4)
        v_entry["bm25_score"] = round(bm25_scores.get(doc_idx, 0.0), 2)
        v_entry["confidence"] = round(min(1.0, rrf_score * 35.0), 2)
        results.append(v_entry)
        seen_keys.add(key)
        if len(results) >= top_k:
            break

    return results


# Backward compatibility alias
search_verses = search_verses_hybrid


def get_verse_index_size() -> int:
    return len(_VERSES)

