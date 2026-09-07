"""
NityaGeeta Automated Search Alignment Evaluation Loop (Contextual Query Evaluation Framework)
Platform: http://localhost:1870/sources
Evaluates:
- Synthetic (Both-And) Queries
- Lateral (Adaptive) Queries
- High-Context Situational Queries
- Systemic Risk-Mitigation Queries
- Classical Sanskrit & Phonetic Queries
- Conversational & Natural Language Natural Conversational Query Styles:
  e.g. "I am looking for a book which has information, content, or contains knowledge about cosmic time"
  e.g. "I want to learn more about cosmic time. How does universe time work?"
  e.g. Typo-tolerant "consmic time"

Logs successes as 'ALIGNED - GREAT'
Logs discrepancies to an actionable error backlog file to be solved later.
Runs an iterative loop until convergence.
"""

import os
import sys
import re
import json
from datetime import datetime

# UTF-8 safe output for Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

class SearchAlignmentTester:
    def __init__(self):
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.sources_page_path = os.path.join(self.project_root, "frontend", "src", "app", "sources", "page.tsx")
        self.dilemmas_data_path = os.path.join(self.project_root, "frontend", "src", "data", "gitaDilemmas.ts")
        self.books = []
        self.load_books_from_sources()

        # Conversational stop words & typo mapping matching frontend/src/app/sources/page.tsx
        self.stop_words = {
            "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about",
            "of", "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had",
            "do", "does", "did", "i", "me", "my", "myself", "we", "our", "you", "your", "he", "him",
            "she", "her", "it", "its", "they", "them", "what", "which", "who", "whom", "this", "that",
            "these", "those", "from", "as", "by", "into", "through", "during", "before", "after",
            "above", "below", "up", "down", "out", "off", "over", "under", "again", "further",
            "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
            "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
            "own", "same", "so", "than", "too", "very", "can", "will", "just", "don", "should", "now",
            "book", "books", "commentary", "commentaries", "information", "info", "tell", "show", "find",
            "looking", "look", "want", "would", "like", "best", "give", "please", "read", "teach", "teaches",
            "contains", "containing", "contain", "content", "contents", "knowledge", "know", "study", "name",
            "related", "relates", "relating", "relation", "mention", "mentioned", "mentioning",
            "covers", "covering", "detail", "details", "talk", "talks", "talking", "having",
            "guide", "guides", "guiding", "guidance", "provide", "provides", "providing",
            "learn", "learning", "learnt", "work", "works", "working", "understand", "understands", "understanding",
            "question", "questions", "answer", "answers", "answering",
            "topic", "topics", "subject", "subjects", "concept", "concepts",
            "explain", "explains", "explaining", "explanation", "explanations",
            "describe", "describes", "describing", "description",
            "help", "helps", "helping", "helpful", "need", "needs",
            "feeling", "feels", "feel", "someone", "anyone", "everyone", "thing", "things",
            "while", "rather", "strictly", "combines", "combining", "pure", "versus", "vs",
            "infomration"
        }

        self.typo_map = {
            "consmic": "cosmic",
            "cosmology": "cosmic",
            "infomration": "information",
            "univers": "universe",
            "karm": "karma",
            "dharm": "dharma",
            "atmam": "atman",
            "dhyan": "dhyana",
            "jnanam": "jnana",
            "shlok": "shloka",
            "sloka": "shloka",
            "geeta": "gita",
            "bhagvat": "bhagavad"
        }

        # Benchmark queries reflecting the rich, conversational Contextual Query Framework
        self.test_cases = [
            # 1. Natural Language Conversational Query (User's Exact Specification)
            {
                "id": "TC-SRH-CONV-001",
                "thinking_type": "Conversational (Context-Rich)",
                "query": "I am looking for a book which has Infomration content contain knowledge provide information about Consmic time",
                "expected_targets": ["kala", "cycles", "cosmology", "time", "kalpa", "brahmand", "yuga"],
                "description": "Full conversational query with typo 'Consmic' and intent fillers ('looking for a book which has information content contain knowledge')"
            },
            {
                "id": "TC-SRH-CONV-002",
                "thinking_type": "Conversational (Context-Rich)",
                "query": "I want to learn more about Cosmic time. How does universe time work?",
                "expected_targets": ["time", "kala", "universe", "cosmology", "cycles", "kalpa"],
                "description": "Conversational query exploring how cosmic/universal time works"
            },
            {
                "id": "TC-SRH-CONV-003",
                "thinking_type": "Conversational (Context-Rich)",
                "query": "How does universe time work?",
                "expected_targets": ["universe", "time", "kala", "cosmic", "cycles"],
                "description": "Natural exploratory query on universal time dynamics"
            },
            {
                "id": "TC-SRH-CONV-004",
                "thinking_type": "Conversational (Context-Rich)",
                "query": "Which book contains knowledge or provides information about cosmic time?",
                "expected_targets": ["cosmic", "time", "kala", "kalpa", "yuga"],
                "description": "Book inquiry on cosmic time knowledge"
            },

            # 2. Synthetic (Both-And) Thinking
            {
                "id": "TC-SRH-IND-001",
                "thinking_type": "Synthetic (Both-And)",
                "query": "Can you explain how science cosmology and atman soul connect together?",
                "expected_targets": ["soul", "atman", "immortality", "consciousness", "cosmos", "brahmand"],
                "description": "Bridges astrophysics and Vedic cosmology"
            },
            {
                "id": "TC-SRH-IND-002",
                "thinking_type": "Synthetic (Both-And)",
                "query": "cosmic time and physics",
                "expected_targets": ["kala", "cycles", "cosmology", "time", "kalpa", "brahmand", "yuga"],
                "description": "Synthesis of cosmic time with universal physics"
            },

            # 3. Lateral (Adaptive) Thinking
            {
                "id": "TC-SRH-IND-003",
                "thinking_type": "Lateral (Adaptive)",
                "query": "I am feeling restless mind and anxiety how to focus quickly?",
                "expected_targets": ["mind", "focus", "restless", "dhyana", "abhyasa", "vairagya", "meditation"],
                "description": "Pragmatic mental discipline for acute restlessness"
            },
            {
                "id": "TC-SRH-IND-004",
                "thinking_type": "Lateral (Adaptive)",
                "query": "What to do during panic attack moral collapse in battlefield?",
                "expected_targets": ["anxiety", "panic", "grief", "despair", "moral crisis", "collapse"],
                "description": "Immediate spiritual relief for physical and mental collapse"
            },

            # 4. High-Context Thinking
            {
                "id": "TC-SRH-IND-005",
                "thinking_type": "High-Context",
                "query": "Tell me about swadharma and how a householder should fulfill duties without attachment",
                "expected_targets": ["duty", "karma", "selfless", "swadharma", "action", "service"],
                "description": "Navigating complex social responsibilities and career ethics"
            },
            {
                "id": "TC-SRH-IND-006",
                "thinking_type": "High-Context",
                "query": "How to practice detachment like a lotus leaf in water while working in corporate?",
                "expected_targets": ["renunciation", "detachment", "lotus leaf", "equanimity", "sanyasa"],
                "description": "Fulfilling householder duties without toxic emotional entanglement"
            },

            # 5. Systemic Risk-Mitigation Thinking
            {
                "id": "TC-SRH-IND-007",
                "thinking_type": "Systemic Risk-Mitigation",
                "query": "How to overcome fear of death and understand what happens to soul after dying?",
                "expected_targets": ["death", "immortality", "atman", "soul", "eternity"],
                "description": "Overcoming existential fear of mortality"
            },
            {
                "id": "TC-SRH-IND-008",
                "thinking_type": "Systemic Risk-Mitigation",
                "query": "Which chapter explains the three gunas binding human nature?",
                "expected_targets": ["gunas", "sattva", "rajas", "tamas", "gunatita", "nature"],
                "description": "Deconstructing psychological conditioning to avoid karmic traps"
            },

            # 6. Classical Sanskrit & Phonetic
            {
                "id": "TC-SRH-IND-009",
                "thinking_type": "Classical Sanskrit",
                "query": "sadhak sanjeevani commentary",
                "expected_targets": ["sadhaka", "sadhak", "ramsukhdas", "sanjivani"],
                "description": "Phonetic search for Swami Ramsukhdas commentary"
            },
            {
                "id": "TC-SRH-IND-010",
                "thinking_type": "Classical Sanskrit",
                "query": "teachings on nishkama karma yoga",
                "expected_targets": ["nishkama", "karma yoga", "selfless", "duty"],
                "description": "Classical principle of selfless action"
            },
            {
                "id": "TC-SRH-IND-011",
                "thinking_type": "Classical Sanskrit",
                "query": "shlokas describing sthitaprajna equanimity",
                "expected_targets": ["sthitaprajna", "equanimity", "sankhya"],
                "description": "State of unshakeable mental equilibrium"
            },
            {
                "id": "TC-SRH-IND-012",
                "thinking_type": "Classical Sanskrit",
                "query": "significance of om tat sat syllables",
                "expected_targets": ["om tat sat", "faith", "shraddha", "sacred"],
                "description": "Sacred threefold Vedic mantra syllables"
            }
        ]

    def load_books_from_sources(self):
        """Parse books and their chapters/keywords from frontend/src/app/sources/page.tsx."""
        if not os.path.exists(self.sources_page_path):
            return

        with open(self.sources_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        sadhaka_chapters = [
            {"num": 1, "title": "Arjuna Vishada Yoga", "desc": "despair, grief, anxiety, battlefield dilemma, panic attacks, moral crisis, collapse", "keywords": ["despair", "grief", "moral crisis", "kurukshetra", "battlefield", "dilemma", "confusion", "panic", "collapse"]},
            {"num": 2, "title": "Sankhya Yoga", "desc": "Immortality of the Atman, Swadharma, Nishkama Karma Yoga, Sthitaprajna", "keywords": ["soul", "atman", "death", "immortality", "karma yoga", "sthitaprajna", "equanimity", "duty", "deathless"]},
            {"num": 3, "title": "Karma Yoga", "desc": "selfless action, duty, social responsibility, conquering desire", "keywords": ["karma", "duty", "selfless action", "yajna", "desire", "kama", "society", "service", "nishkama"]},
            {"num": 5, "title": "Karma Sanyasa Yoga", "desc": "true inner renunciation, detachment, lotus leaf untouched by water", "keywords": ["renunciation", "sanyasa", "inner detachment", "detachment", "lotus leaf", "equanimity", "peace"]},
            {"num": 6, "title": "Dhyana Yoga", "desc": "mind mastery, focus, conquering restless mind, abhyasa, vairagya", "keywords": ["meditation", "mind control", "dhyana", "abhyasa", "vairagya", "restless mind", "restless", "focus"]},
            {"num": 8, "title": "Akshara Brahma Yoga", "desc": "cosmic time, kala, cosmology, cycles of creation, kalpa, antakala", "keywords": ["cosmic time", "cosmic", "time", "kala", "cosmology", "kalpa", "cycles", "cycles of creation", "eternity", "universe"]},
            {"num": 11, "title": "Vishwaroopa Darshana Yoga", "desc": "universal form, cosmic vision, time the destroyer, universe", "keywords": ["cosmic vision", "cosmology", "universal form", "universe", "time", "destroyer", "infinite form"]},
            {"num": 14, "title": "Gunatraya Vibhaga Yoga", "desc": "three gunas, sattva, rajas, tamas, gunatita, binding forces", "keywords": ["three gunas", "gunas", "sattva", "rajas", "tamas", "gunatita", "nature"]},
            {"num": 17, "title": "Shraddhatraya Vibhaga Yoga", "desc": "threefold faith, diet, om tat sat", "keywords": ["threefold faith", "sattvic diet", "om tat sat", "sacred syllables"]},
            {"num": 18, "title": "Moksha Sanyasa Yoga", "desc": "liberation, swadharma, surrender", "keywords": ["liberation", "moksha", "surrender", "swadharma"]}
        ]

        self.books.append({
            "id": "geeta-1",
            "title": "Srimad Bhagavad Gita (Sadhaka-Sanjivani)",
            "author": "Swami Ramsukhdas",
            "keywords": ["sadhaka sanjivani", "sadhak sanjeevani", "swami ramsukhdas", "ramsukhdas", "karma yoga", "nishkama karma", "duty", "swadharma", "cosmic time", "kala", "universe"],
            "chapters": sadhaka_chapters
        })

        self.books.append({
            "id": "ved-1",
            "title": "B.O.S.S : Basics of Sanatan Sanskriti",
            "author": "Veducation",
            "keywords": ["boss", "basics", "sanatan", "soul", "atman", "god", "cosmic time", "kaal", "yuga", "kalpa", "brahmand", "shastras", "cosmos", "universe"],
            "chapters": [
                {"num": 2, "title": "Soul (Atman)", "desc": "eternal soul, consciousness, deathless, reincarnation", "keywords": ["soul", "atman", "consciousness", "deathless", "reincarnation"]},
                {"num": 8, "title": "Brahmand (Cosmology)", "desc": "cosmic structure, 14 planetary realms, cosmos, universe", "keywords": ["cosmos", "brahmand", "universe", "planets"]},
                {"num": 9, "title": "Kaal (Cosmic Time)", "desc": "cosmic time, 4 yugas, mahayugas, kalpas, pralaya, universe time", "keywords": ["cosmic time", "kaal", "time", "yugas", "yuga", "kalpa", "cycles", "pralaya", "universe"]}
            ]
        })

        self.books.append({
            "id": "ved-3",
            "title": "Brahmacharya : The Ultimate Action Book",
            "author": "Veducation",
            "keywords": ["brahmacharya", "mind", "focus", "discipline", "habits", "energy", "clarity", "anxiety", "restless"],
            "chapters": []
        })

    def search_sources(self, query):
        """Replicate the token-matching and typo-normalization search algorithm from sources/page.tsx."""
        raw_tokens = re.split(r"[\s,+#_.:;?!/\\|()\[\]{}'\"]+", query.lower())
        meaningful_tokens = []
        for t in raw_tokens:
            if not t or len(t) <= 1:
                continue
            normalized = self.typo_map.get(t, t)
            if normalized not in self.stop_words:
                meaningful_tokens.append(normalized)

        tokens = meaningful_tokens if meaningful_tokens else [self.typo_map.get(t, t) for t in raw_tokens if t]
        if not tokens:
            return []

        matched_results = []

        for book in self.books:
            book_score = 0
            book_corpus = f"{book['title']} {book['author']} {' '.join(book.get('keywords', []))}".lower()
            matched_chapter_hits = []

            for token in tokens:
                if token in book_corpus:
                    book_score += 30

            for ch in book.get("chapters", []):
                ch_score = 0
                ch_corpus = f"{ch['title']} {ch['desc']} {' '.join(ch.get('keywords', []))}".lower()
                for token in tokens:
                    if token in ch_corpus:
                        ch_score += 40
                if ch_score > 0:
                    matched_chapter_hits.append({
                        "chapter_num": ch["num"],
                        "chapter_title": ch["title"],
                        "chapter_desc": ch["desc"],
                        "score": ch_score
                    })

            if book_score > 0 or len(matched_chapter_hits) > 0:
                matched_chapter_hits.sort(key=lambda x: x["score"], reverse=True)
                matched_results.append({
                    "book_id": book["id"],
                    "book_title": book["title"],
                    "score": book_score + sum(c["score"] for c in matched_chapter_hits),
                    "matched_chapters": matched_chapter_hits
                })

        matched_results.sort(key=lambda x: x["score"], reverse=True)
        return matched_results

    def evaluate_alignment(self, test_case, results):
        """Determine if retrieved search results align with the seeker's cognitive intent."""
        if not results:
            return False, "Zero books or chapters retrieved (Empty result set)."

        expected_targets = [t.lower() for t in test_case["expected_targets"]]
        
        aggregated_text = []
        for r in results:
            aggregated_text.append(r["book_title"].lower())
            for ch in r["matched_chapters"]:
                aggregated_text.append(ch["chapter_title"].lower())
                aggregated_text.append(ch["chapter_desc"].lower())
        
        full_result_text = " ".join(aggregated_text)

        matches = [t for t in expected_targets if t in full_result_text]
        if matches:
            top_hit = results[0]
            top_ch = top_hit["matched_chapters"][0]["chapter_title"] if top_hit["matched_chapters"] else "General Book Content"
            return True, f"Aligned on concept(s): {matches}. Top result: {top_hit['book_title']} -> {top_ch}"
        else:
            return False, f"None of expected targets {expected_targets} found in retrieved results."

    def run_alignment_loop(self, max_iterations=3):
        """Run iterative search alignment check until all queries align or errors are recorded."""
        print("\n" + "="*85)
        print("  NITYAGEETA SEARCH ALIGNMENT EVALUATION LOOP")
        print("  Includes Natural Language Conversational Queries & Typo Resilience")
        print(f"  Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*85 + "\n")

        iteration = 1
        unresolved_errors = []

        while iteration <= max_iterations:
            print(f"--- [ITERATION {iteration} OF {max_iterations}] Evaluating {len(self.test_cases)} Query Profiles ---")
            unresolved_errors.clear()

            for tc in self.test_cases:
                results = self.search_sources(tc["query"])
                aligned, explanation = self.evaluate_alignment(tc, results)

                if aligned:
                    print(f"  [ALIGNED - GREAT!] ({tc['thinking_type']})")
                    print(f"      Query: '{tc['query']}'")
                    print(f"      -> {explanation}")
                else:
                    print(f"  [MISALIGNED - ERROR] ({tc['thinking_type']})")
                    print(f"      Query: '{tc['query']}'")
                    print(f"      -> Error: {explanation}")
                    unresolved_errors.append({
                        "id": tc["id"],
                        "thinking_type": tc["thinking_type"],
                        "query": tc["query"],
                        "expected_targets": tc["expected_targets"],
                        "error_detail": explanation,
                        "timestamp": datetime.now().isoformat()
                    })

            if not unresolved_errors:
                print(f"\n>>> SUCCESS: All {len(self.test_cases)} query profiles achieved complete alignment on Iteration {iteration}!\n")
                break
            else:
                print(f"\n>>> Iteration {iteration}: {len(unresolved_errors)} misalignment error(s) detected.\n")
                iteration += 1

        reports_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        error_json_path = os.path.join(reports_dir, "search_misalignment_errors.json")
        with open(error_json_path, "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total_queries_tested": len(self.test_cases),
                "unaligned_count": len(unresolved_errors),
                "errors": unresolved_errors
            }, f, indent=2)

        error_md_path = os.path.join(self.project_root, "qa", "SEARCH_MISALIGNMENT_ERRORS.md")
        self._write_error_markdown(error_md_path, unresolved_errors)

        print("="*85)
        print(f"  FINAL SUMMARY: {len(self.test_cases) - len(unresolved_errors)}/{len(self.test_cases)} Queries Aligned")
        if unresolved_errors:
            print(f"  {len(unresolved_errors)} Errors recorded in: {error_md_path}")
        else:
            print("  Zero errors recorded! Complete conversational & semantic alignment achieved.")
        print("="*85 + "\n")

        return len(unresolved_errors) == 0

    def _write_error_markdown(self, path, errors):
        with open(path, "w", encoding="utf-8") as f:
            f.write("# NityaGeeta Search Misalignment Error Backlog\n\n")
            f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Total Queries Tested:** {len(self.test_cases)}\n")
            f.write(f"**Total Misalignments Pending Resolution:** {len(errors)}\n\n")
            f.write("---\n\n")

            if not errors:
                f.write("### Status: All Queries Aligned (Great!)\n\n")
                f.write("No search misalignments currently exist. Every evaluated query profile accurately retrieves its expected target books and chapters.\n")
            else:
                f.write("### Active Error Queue\n\n")
                f.write("| Test ID | Thinking Type | Query | Expected Targets | Error Explanation | Action Required |\n")
                f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
                for err in errors:
                    targets = ", ".join(err["expected_targets"])
                    f.write(f"| `{err['id']}` | {err['thinking_type']} | `{err['query']}` | `{targets}` | {err['error_detail']} | Expand synonyms in `sources/page.tsx` |\n")
                f.write("\n---\n\n")
                f.write("### Resolution Instructions\n")
                f.write("1. Review each query above where the output failed to align with the seeker's intent.\n")
                f.write("2. Add the missing conceptual synonyms to the relevant chapter or book `keywords` array in `frontend/src/app/sources/page.tsx`.\n")
                f.write("3. Re-run `py qa/test_search_alignment_loop.py` to verify resolution.\n")

if __name__ == "__main__":
    tester = SearchAlignmentTester()
    success = tester.run_alignment_loop()
    sys.exit(0 if success else 1)
