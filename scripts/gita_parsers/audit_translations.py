"""
scripts/gita_parsers/audit_translations.py
NityaGeeta — Translation Quality Audit

WHAT THIS SCRIPT DOES:
  Loads gita_press_translated.json and checks EVERY page for:
  1. LOOPING / REPETITION — Same paragraph repeated multiple times (AI hallucination)
  2. UNTRANSLATED DEVANAGARI — Hindi/Sanskrit characters left in English field
  3. DEVANAGARI NUMBERS — ०-९ digits left in English field instead of 0-9
  4. ENGLISH TOO SHORT — English is less than 30% of Sanskrit length (severe under-translation)
  5. ENGLISH MISSING — No English text at all

  Outputs:
    - Console summary per page
    - ./data/output/gita_editions/translation_audit_report.md  (full report)
    - ./data/output/gita_editions/pages_to_retranslate.txt    (list of bad page numbers)
    - ./data/output/gita_editions/untranslated_terms.md       (Sanskrit terms left untranslated)
"""

import json
import re
import os
import sys
from collections import Counter

# ── Paths ─────────────────────────────────────────────────────────────────────
INPUT_JSON  = "./data/output/gita_editions/gita_press_translated.json"
REPORT_MD   = "./data/output/gita_editions/translation_audit_report.md"
RETRANS_TXT = "./data/output/gita_editions/pages_to_retranslate.txt"
TERMS_MD    = "./data/output/gita_editions/untranslated_terms.md"

# ── Devanagari Unicode ranges ─────────────────────────────────────────────────
DEVANAGARI_RE   = re.compile(r'[\u0900-\u097F]+')          # any Devanagari text
DEVA_DIGITS_RE  = re.compile(r'[०-९]+')                   # Devanagari numerals only
DEVA_NUMBER_RE  = re.compile(r'[०-९]')                    # single Devanagari digit

# ── Repetition detection ──────────────────────────────────────────────────────
def detect_repetition(text: str) -> tuple[bool, str, int]:
    """
    Returns (is_repeated, repeated_phrase, repeat_count).
    Splits text into paragraphs and checks if any paragraph appears ≥3 times.
    """
    if not text:
        return False, "", 0
    
    # Split by double newline (paragraph breaks)
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if len(p.strip()) > 80]
    
    if len(paragraphs) < 3:
        return False, "", 0
    
    counter = Counter(paragraphs)
    most_common_para, count = counter.most_common(1)[0]
    
    if count >= 3:
        return True, most_common_para[:120] + "...", count
    
    # Also check sentence-level repetition
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 60]
    if sentences:
        counter2 = Counter(sentences)
        most_common_sent, count2 = counter2.most_common(1)[0]
        if count2 >= 4:
            return True, most_common_sent[:120] + "...", count2
    
    return False, "", 0

# ── Find untranslated Sanskrit terms ─────────────────────────────────────────
def find_devanagari_in_english(english_text: str) -> list[str]:
    """Returns list of Devanagari words/phrases found in the English field."""
    return DEVANAGARI_RE.findall(english_text)

def find_deva_digits(english_text: str) -> list[str]:
    """Returns list of Devanagari digit sequences in the English field."""
    return DEVA_DIGITS_RE.findall(english_text)

# ── Score each page ───────────────────────────────────────────────────────────
def audit_page(page_data: dict) -> dict:
    page_num    = page_data.get("page", "?")
    original    = page_data.get("original", "") or ""
    english     = page_data.get("english", "") or ""
    
    issues = []
    severity = "OK"  # OK, WARN, ERROR
    
    # 1. Missing English
    if not english.strip():
        issues.append("❌ MISSING: No English translation at all")
        severity = "ERROR"
        return {"page": page_num, "severity": severity, "issues": issues,
                "original_chars": len(original), "english_chars": 0,
                "deva_terms": [], "deva_digits": []}
    
    # 2. Repetition / Looping
    is_repeated, repeated_phrase, repeat_count = detect_repetition(english)
    if is_repeated:
        issues.append(f"🔁 LOOPING: Paragraph repeated {repeat_count}× — \"{repeated_phrase}\"")
        severity = "ERROR"
    
    # 3. Devanagari digits left in English
    deva_digits = find_deva_digits(english)
    if deva_digits:
        issues.append(f"🔢 DEVA-DIGITS: Found {len(deva_digits)} Devanagari number(s): {', '.join(set(deva_digits[:5]))}")
        if severity == "OK":
            severity = "WARN"
    
    # 4. Untranslated Devanagari text in English
    deva_terms = find_devanagari_in_english(english)
    # Filter out single characters and digits (already handled above)
    deva_terms_long = [t for t in deva_terms if len(t) > 2 and not DEVA_DIGITS_RE.fullmatch(t)]
    if deva_terms_long:
        issues.append(f"📝 UNTRANSLATED: {len(deva_terms_long)} Devanagari word(s) in English: {', '.join(set(deva_terms_long[:6]))}")
        if severity == "OK":
            severity = "WARN"
    
    # 5. Severely short English (less than 25% of original length)
    orig_len = len(original)
    eng_len  = len(english)
    ratio    = eng_len / orig_len if orig_len > 0 else 1.0
    if ratio < 0.25 and orig_len > 200:
        issues.append(f"⚠️ TOO SHORT: English ({eng_len} chars) is only {ratio*100:.0f}% of original ({orig_len} chars)")
        if severity == "OK":
            severity = "WARN"
    
    # 6. Check if English starts with Devanagari (wrong text in wrong field)
    if english.strip() and DEVANAGARI_RE.match(english.strip()[:10]):
        issues.append("🚨 WRONG FIELD: English field starts with Devanagari text!")
        severity = "ERROR"
    
    if not issues:
        issues.append("✅ All checks passed")
    
    return {
        "page": page_num,
        "severity": severity,
        "issues": issues,
        "original_chars": orig_len,
        "english_chars": eng_len,
        "ratio": ratio,
        "deva_terms": list(set(deva_terms_long[:10])),
        "deva_digits": list(set(deva_digits[:5])),
        "is_looping": is_repeated,
    }

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not os.path.exists(INPUT_JSON):
        print(f"❌ File not found: {INPUT_JSON}")
        sys.exit(1)
    
    print("=" * 70)
    print("  NITYAGEETA — Translation Quality Audit")
    print("=" * 70)
    print(f"\n  Loading: {INPUT_JSON}")
    
    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        pages = json.load(f)
    
    print(f"  Total pages in file: {len(pages)}\n")
    print("-" * 70)
    
    results      = []
    errors       = []
    warnings     = []
    ok_pages     = []
    all_deva_terms = Counter()
    
    for page_data in pages:
        result = audit_page(page_data)
        results.append(result)
        
        page_num = result["page"]
        severity = result["severity"]
        
        # Track Devanagari terms across all pages
        for term in result.get("deva_terms", []):
            all_deva_terms[term] += 1
        
        if severity == "ERROR":
            errors.append(page_num)
            prefix = f"  🔴 Page {page_num:4d}"
        elif severity == "WARN":
            warnings.append(page_num)
            prefix = f"  🟡 Page {page_num:4d}"
        else:
            ok_pages.append(page_num)
            prefix = f"  🟢 Page {page_num:4d}"
        
        # Print to console
        for i, issue in enumerate(result["issues"]):
            if i == 0:
                print(f"{prefix} | {issue}")
            else:
                print(f"               | {issue}")
    
    print("\n" + "=" * 70)
    print(f"  SUMMARY:")
    print(f"    🔴 ERRORS   (must retranslate): {len(errors)} pages")
    print(f"    🟡 WARNINGS (minor issues):     {len(warnings)} pages")
    print(f"    🟢 OK                           {len(ok_pages)} pages")
    print(f"    📄 Total audited:               {len(results)} pages")
    print("=" * 70)
    
    # ── Write Markdown Report ─────────────────────────────────────────────────
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write("# NityaGeeta — Translation Audit Report\n\n")
        f.write(f"**Source:** `{INPUT_JSON}`  \n")
        f.write(f"**Total Pages Audited:** {len(results)}  \n\n")
        f.write("---\n\n")
        f.write("## Summary\n\n")
        f.write(f"| Status | Count | Pages |\n")
        f.write(f"|--------|-------|-------|\n")
        f.write(f"| 🔴 ERROR | {len(errors)} | {errors} |\n")
        f.write(f"| 🟡 WARN  | {len(warnings)} | {warnings} |\n")
        f.write(f"| 🟢 OK    | {len(ok_pages)} | (see below) |\n\n")
        f.write("---\n\n")
        f.write("## Detailed Issues Per Page\n\n")
        
        for result in results:
            if result["severity"] != "OK":
                pg = result["page"]
                sev = result["severity"]
                icon = "🔴" if sev == "ERROR" else "🟡"
                f.write(f"### {icon} Page {pg} [{sev}]\n\n")
                f.write(f"- Original: **{result['original_chars']} chars**\n")
                f.write(f"- English:  **{result['english_chars']} chars** ")
                if 'ratio' in result:
                    f.write(f"({result['ratio']*100:.0f}% of original)\n")
                else:
                    f.write("\n")
                f.write("\n**Issues:**\n")
                for issue in result["issues"]:
                    f.write(f"- {issue}\n")
                if result.get("deva_terms"):
                    f.write(f"\n**Devanagari found in English field:**\n")
                    for term in result["deva_terms"]:
                        f.write(f"- `{term}`\n")
                f.write("\n---\n\n")
        
        f.write("## All Clean Pages\n\n")
        f.write(f"{ok_pages}\n\n")
    
    # ── Write retranslation list ───────────────────────────────────────────────
    bad_pages = sorted(set(errors + warnings))
    error_pages_only = sorted(set(errors))
    
    with open(RETRANS_TXT, "w", encoding="utf-8") as f:
        f.write("# Pages That Need Retranslation\n\n")
        f.write("## CRITICAL (ERROR — must fix):\n")
        f.write(", ".join(str(p) for p in error_pages_only) + "\n\n")
        f.write("## ALL (ERROR + WARN):\n")
        f.write(", ".join(str(p) for p in bad_pages) + "\n\n")
        f.write("## Commands to retranslate each error page:\n\n")
        for p in error_pages_only:
            f.write(f"python scripts/gita_parsers/fix_gita_press_translation.py --start {p} --end {p} --force\n")
    
    # ── Write untranslated terms ───────────────────────────────────────────────
    with open(TERMS_MD, "w", encoding="utf-8") as f:
        f.write("# Untranslated Sanskrit/Hindi Terms Found in English Fields\n\n")
        f.write("These Devanagari words were left untranslated in the English output.\n")
        f.write("Use this as a reference to look up their meanings.\n\n")
        f.write("| Term (Devanagari) | Appears on Pages | Count |\n")
        f.write("|-------------------|-----------------|-------|\n")
        
        # Map term → pages
        term_pages = {}
        for result in results:
            for term in result.get("deva_terms", []):
                if term not in term_pages:
                    term_pages[term] = []
                term_pages[term].append(result["page"])
        
        for term, count in all_deva_terms.most_common(100):
            pages_str = ", ".join(str(p) for p in term_pages.get(term, [])[:10])
            f.write(f"| {term} | {pages_str} | {count} |\n")
    
    print(f"\n  📋 Full report:         {REPORT_MD}")
    print(f"  📄 Pages to retranslate: {RETRANS_TXT}")
    print(f"  📖 Untranslated terms:   {TERMS_MD}")
    print()
    
    if error_pages_only:
        print(f"  🔴 CRITICAL pages to fix: {error_pages_only}")
        print()
        print("  Run these commands to fix ERROR pages:")
        # Group consecutive pages for efficiency
        groups = []
        start = error_pages_only[0]
        end = error_pages_only[0]
        for p in error_pages_only[1:]:
            if p == end + 1:
                end = p
            else:
                groups.append((start, end))
                start = p
                end = p
        groups.append((start, end))
        
        for s, e in groups:
            print(f"    python scripts/gita_parsers/fix_gita_press_translation.py --start {s} --end {e} --force")
    
    print()

if __name__ == "__main__":
    main()
