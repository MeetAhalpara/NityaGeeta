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
import logging
from collections import defaultdict
from typing import List, Dict, Any, Set

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
_INV: Dict[str, List[int]] = defaultdict(list)   # word → [verse indices]
_VOCAB: Set[str] = set()                          # all unique words in corpus

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

    for item in pages:
        orig = str(item.get("original",""))
        eng  = str(item.get("english",""))
        page = item.get("page", 0)
        if _VEND not in orig: continue
        if len(re.findall(r"[\u0900-\u097f]", orig)) < 20: continue

        # Largest Devanagari block with verse marker
        best, best_len = None, 0
        for m in re.finditer(r"((?:[^\n]*[\u0900-\u097f][^\n]*\n?){1,6})", orig):
            blk = m.group(1)
            if _VEND not in blk: continue
            n = len(re.findall(r"[\u0900-\u097f]", blk))
            if n > best_len: best_len, best = n, blk

        if not best: continue
        ch, v = _verse_num(best)
        if not v:
            cm = ch_re.search(eng)
            ch = cm.group(1) if cm else ""
        if not v: continue
        # Reject entries without a chapter number — they're index/reference pages
        if not ch: continue

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
            if re.match(r"[A-Z]", s) and len(s) > 30:
                english = _first_sentence(s[:600]); break
        if len(english) < 20: continue
        # Reject entries where english is mostly IAST (no real translation available)
        if len(re.findall(r"[āīūṛṁḥṭḍṇśṣñ]", english)) >= 5: continue

        # Rich text = full english commentary page
        rich = re.sub(r"[āīūṛṁḥṭḍṇśṣñĀĪŪṚṂḤṬḌṆŚṢÑ]", " ", eng)

        sanskrit = _clean_sanskrit(best)
        if not sanskrit: continue

        results.append({
            "chapter": ch or "", "verse": v,
            "citation": f"Chapter {ch}, Verse {v}" if ch else f"Verse {v}",
            "sanskrit": sanskrit,
            "english":  english,
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
        if key not in seen or PRIO.get(v["source"],9) < PRIO.get(seen[key]["source"],9):
            seen[key] = v
    return list(seen.values())


# ── Build inverted index ──────────────────────────────────────────────────────

def _build_inverted(verses: List[Dict[str,Any]]) -> None:
    global _INV, _VOCAB
    _INV = defaultdict(list)
    _VOCAB = set()
    for idx, v in enumerate(verses):
        kw_set = set(v.get("keywords",[]))
        _VOCAB.update(kw_set)
        for w in kw_set:
            _INV[w].append(idx)


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
    logger.info(f"Verse index ready: {len(_VERSES)} unique shlokas | vocab: {len(_VOCAB)} words")


# ── Public: search ────────────────────────────────────────────────────────────

def search_verses(query: str, top_k: int = 3) -> List[Dict[str,Any]]:
    """
    Returns top_k verses most relevant to the query.

    Pipeline:
      1. Tokenise query
      2. Expand each token via SYN map  (covers all major Gita themes)
      3. For unknown tokens → find vocabulary words that share a 4-char stem
         (automatic fallback — handles any word not in the synonym map)
      4. Score verses via inverted index
      5. Coherence bonus for 3+ distinct term hits
    """
    if not _VERSES:
        return []

    # Step 1 — tokenise
    raw = _tokenize(query.replace("-",""))
    if not raw:
        raw = [w.lower() for w in query.split() if len(w) >= 3]

    # Step 2 — synonym expansion
    primary:  List[str] = list(set(raw))
    expanded: List[str] = []
    for kw in primary:
        syns = SYN.get(kw, [])
        if not syns:
            # stem match on synonym keys  (e.g. "anxious" → "anxiety")
            for sk in SYN:
                if len(kw) >= 5 and (kw.startswith(sk[:5]) or sk.startswith(kw[:5])):
                    syns = SYN[sk]; break
        expanded.extend(syns)

    # Step 3 — corpus stem fallback for any still-unknown token
    all_search = set(primary) | set(expanded)
    for kw in primary:
        if kw not in _VOCAB and len(kw) >= 4:
            stem = kw[:5]
            for vw in _VOCAB:
                if vw.startswith(stem) or stem.startswith(vw[:4]):
                    all_search.add(vw)

    if not all_search:
        return []

    # Step 4 — score via inverted index
    scores: Dict[int, float]        = defaultdict(float)
    hits:   Dict[int, Set[str]]     = defaultdict(set)

    primary_set  = set(primary)
    expanded_set = set(expanded) - primary_set

    for word in all_search:
        for idx in _INV.get(word, []):
            kw_count = _VERSES[idx]["keywords"].count(word)
            src_boost = 1.2 if _VERSES[idx].get("source") == "Gita Sadhak Sanjeevani" else 1.0
            if word in primary_set:
                scores[idx] += kw_count * 6.0 * src_boost
            elif word in expanded_set:
                scores[idx] += kw_count * 1.0 * src_boost
            else:
                scores[idx] += kw_count * 0.3 * src_boost   # stem-fallback hit
            hits[idx].add(word)

    # Step 5 — coherence bonus
    for idx in scores:
        if len(hits[idx]) >= 3:
            scores[idx] += 5.0

    ranked = sorted(scores.items(), key=lambda x: -x[1])
    return [_VERSES[i] for i, _ in ranked[:top_k]]


def get_verse_index_size() -> int:
    return len(_VERSES)
