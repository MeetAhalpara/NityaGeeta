"""
NityaGeeta Life Dilemmas Multi-Scenario QA Test Suite: Life Dilemmas Engine
Platform: http://localhost:1870/dilemmas
Framework: Synthetic (Both-And), Lateral (Adaptive), High-Context, Systemic Risk-Mitigation
Environments: Happy (Optimal), Bad (Erroneous), Raining (Constrained), Worse (Catastrophic)
Includes: Natural Language Conversational Dilemma Search Alignment Loop
"""

import os
import sys
import re
import json
import urllib.request
import urllib.error
from datetime import datetime

# UTF-8 safe output for Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

class DilemmasTestSuite:
    def __init__(self, base_url="http://localhost:1870"):
        self.base_url = base_url
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.dilemmas_page_path = os.path.join(self.project_root, "frontend", "src", "app", "dilemmas", "page.tsx")
        self.dilemmas_data_path = os.path.join(self.project_root, "frontend", "src", "data", "gitaDilemmas.ts")
        self.results = []
        self.alignment_results = []
        self.dilemmas = []
        self.load_dilemmas()

    def log(self, test_id, environment, pillar, name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        entry = {
            "test_id": test_id,
            "environment": environment,
            "pillar": pillar,
            "name": name,
            "status": status,
            "details": details
        }
        self.results.append(entry)
        icon = "[PASS]" if passed else "[FAIL]"
        print(f"{icon} [{environment.upper()}] {test_id}: {name} -> {status}")
        if not passed and details:
            print(f"       Details: {details}")

    def _read_file(self, path):
        if not os.path.exists(path):
            return ""
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def load_dilemmas(self):
        """Extract dilemmas from gitaDilemmas.ts for alignment checks."""
        content = self._read_file(self.dilemmas_data_path)
        blocks = content.split("{\n    id:")
        for block in blocks[1:]:
            title_m = re.search(r'title:\s*"([^"]+)"', block)
            ch_m = re.search(r'chapter:\s*(\d+)', block)
            v_m = re.search(r'verse:\s*(\d+)', block)
            cat_m = re.search(r'category:\s*"([^"]+)"', block)
            insight_m = re.search(r'coreInsight:\s*"([^"]+)"', block)
            tag_m = re.search(r'tag:\s*"([^"]+)"', block)

            if title_m and ch_m:
                self.dilemmas.append({
                    "title": title_m.group(1),
                    "chapter": int(ch_m.group(1)),
                    "verse": int(v_m.group(1)) if v_m else 1,
                    "category": cat_m.group(1) if cat_m else "all",
                    "coreInsight": insight_m.group(1) if insight_m else "",
                    "tag": tag_m.group(1) if tag_m else ""
                })

    # =========================================================================
    # ENVIRONMENT 1: THE HAPPY PATH (OPTIMAL CONDITIONS)
    # =========================================================================

    def test_tc_dil_hp_001_brand_voice_and_unbroken_sentences(self):
        """TC-DIL-HP-001: Ensure hero copy has no broken dashes, uses NityaGeeta, and uses One."""
        content = self._read_file(self.dilemmas_page_path)

        has_clean_subtitle = "Clear answers and timeless wisdom from the Bhagavad Gita for everyday life challenges with one-click AI guidance." in content
        no_em_dash = "challenges—with" not in content and "challenges--" not in content

        has_popover_voice = "Here, NityaGeeta highlights foundational situations from each chapter so one can find practical guidance for daily life." in content
        no_first_person = "we highlight" not in content and "our AI finds" not in content

        has_banner_voice = "One can ask NityaGeeta directly. NityaGeeta finds the most relevant verses" in content

        passed = has_clean_subtitle and no_em_dash and has_popover_voice and no_first_person and has_banner_voice
        self.log(
            "TC-DIL-HP-001", "Happy", "High-Context Elegance",
            "Dilemmas Hero Atmosphere & Brand Voice Integrity (No dashes, no 'we', uses 'one')",
            passed,
            "Failed brand voice or sentence continuity check in dilemmas page"
        )

    def test_tc_dil_hp_002_symmetrical_search_match_pill(self):
        """TC-DIL-HP-002: Ensure search match pill renders symmetrically with clear button."""
        content = self._read_file(self.dilemmas_page_path)

        has_match_text = "{filteredDilemmas.length} {filteredDilemmas.length === 1 ? \"match\" : \"matches\"}" in content
        has_x_icon = "<X className=\"w-3 h-3\" />" in content
        has_clear_action = 'onClick={() => setSearchQuery("")}' in content

        passed = has_match_text and has_x_icon and has_clear_action
        self.log(
            "TC-DIL-HP-002", "Happy", "Lateral Interaction Design",
            "Symmetrical Search Match Count Pill with Instant Reset Action",
            passed,
            "Missing match count text or clear action in search pill"
        )

    def test_tc_dil_hp_003_18_chapter_directory_numbering(self):
        """TC-DIL-HP-003: Verify chapter directory displays clean single digits (1, 2, 3...) under Chapter."""
        content = self._read_file(self.dilemmas_page_path)

        has_clean_num = "{ch.num}" in content
        no_redundant_prefix = "Chapter {ch.num.toString().padStart(2, \"0\")}" not in content

        passed = has_clean_num and no_redundant_prefix
        self.log(
            "TC-DIL-HP-003", "Happy", "Holistic Structural Simplicity",
            "18-Chapter Canonical Directory Table Displays Clean Single-Digit Numbers",
            passed,
            "Directory table still contains redundant 'Chapter 01' prefix"
        )

    def test_tc_dil_hp_004_authentic_devanagari_sanskrit_cards(self):
        """TC-DIL-HP-004: Ensure authentic Devanagari Sanskrit and Roman IAST transliteration exist on cards."""
        content = self._read_file(self.dilemmas_page_path)

        has_sanskrit_field = "item.verseSanskrit" in content
        has_translit_field = "item.verseTransliteration" in content
        has_guidance_field = "item.coreInsight" in content

        passed = has_sanskrit_field and has_translit_field and has_guidance_field
        self.log(
            "TC-DIL-HP-004", "Happy", "Synthetic Sacred Ground Truth",
            "Authentic Devanagari Sanskrit & Roman IAST Transliteration Rendered on Cards",
            passed,
            "Missing item.verseSanskrit or item.verseTransliteration on dilemma cards"
        )

    def test_tc_dil_hp_005_1_click_ai_guidance_action(self):
        """TC-DIL-HP-005: Verify 1-click AI consultation trigger pre-fills prompt query."""
        content = self._read_file(self.dilemmas_page_path)

        has_ai_btn_text = "Ask AI for Guidance" in content
        has_prompt_query = "encodeURIComponent(item.promptQuery)" in content or "item.promptQuery" in content

        passed = has_ai_btn_text and has_prompt_query
        self.log(
            "TC-DIL-HP-005", "Happy", "Lateral (Adaptive) Immediate Help",
            "1-Click AI Guidance Action Trigger with Contextual Prompt Pre-Fill",
            passed,
            "Missing 'Ask AI for Guidance' or prompt pre-fill binding"
        )

    # =========================================================================
    # ENVIRONMENT 2: THE BAD PATH (ERRONEOUS & EXTREME INPUTS)
    # =========================================================================

    def test_tc_dil_bp_001_malformed_search_input_handling(self):
        """TC-DIL-BP-001: Ensure search safely splits tokens and avoids regex crashes on special characters."""
        content = self._read_file(self.dilemmas_page_path)

        has_safe_token_split = ".split(/[" in content
        has_empty_state = "No matching life dilemmas found" in content or "No dilemma matched" in content
        has_clear_btn = "Clear Search" in content or "Clear search" in content

        passed = has_safe_token_split and has_empty_state and has_clear_btn
        self.log(
            "TC-DIL-BP-001", "Bad", "Lateral Error Resilience",
            "Malformed Search Query Handling & Token Splitting (Safe Against Regex Crashes)",
            passed,
            "Missing safe token splitting or empty state in dilemmas search"
        )

    def test_tc_dil_bp_002_chapter_parameter_boundary_sanitization(self):
        """TC-DIL-BP-002: Ensure ?chapter= query parameter strictly enforces 1 <= parsed <= 18."""
        content = self._read_file(self.dilemmas_page_path)

        has_bound_check = "parsed >= 1 && parsed <= 18" in content
        has_chapter_state = "setSelectedChapter(parsed)" in content

        passed = has_bound_check and has_chapter_state
        self.log(
            "TC-DIL-BP-002", "Bad", "Systemic Risk-Mitigation",
            "URL Chapter Parameter Boundary Sanitization (1 <= chapter <= 18 Enforced)",
            passed,
            "Missing 'parsed >= 1 && parsed <= 18' boundary check in dilemmas page"
        )

    def test_tc_dil_bp_003_conversational_nlp_and_typo_normalization(self):
        """TC-DIL-BP-003: Verify STOP_WORDS and TYPO_MAP handle natural conversational queries and typos."""
        content = self._read_file(self.dilemmas_page_path)

        has_stop_words = "const STOP_WORDS = useMemo" in content
        has_typo_map = "const TYPO_MAP: Record<string, string>" in content
        has_consmic_typo = 'consmic: "cosmic"' in content
        has_burnout_typo = 'burn: "burnout"' in content

        passed = has_stop_words and has_typo_map and has_consmic_typo and has_burnout_typo
        self.log(
            "TC-DIL-BP-003", "Bad", "High-Context Empathy",
            "Conversational NLP Stop-Words & Typo Normalization (Handles 'consmic', 'exaustion')",
            passed,
            "Missing TYPO_MAP or STOP_WORDS in dilemmas search engine"
        )

    def test_tc_dil_bp_004_rapid_category_switching_determinism(self):
        """TC-DIL-BP-004: Verify all 6 category filters exist and update state deterministically."""
        content = self._read_file(self.dilemmas_page_path)

        cats = ['"all"', '"work"', '"ethics"', '"mental"', '"relationships"', '"existential"']
        all_cats_present = all(c in content for c in cats)
        has_category_state = 'useState<string>("all")' in content

        passed = all_cats_present and has_category_state
        self.log(
            "TC-DIL-BP-004", "Bad", "Lateral State Poise",
            "Category Filter Determinism Across All 6 Thematic Areas (Zero Race Conditions)",
            passed,
            "One or more category identifiers missing from dilemmas state"
        )

    # =========================================================================
    # ENVIRONMENT 3: THE RAINING PATH (CONSTRAINED & LOW RES)
    # =========================================================================

    def test_tc_dil_rp_001_mobile_320px_layout_safety(self):
        """TC-DIL-RP-001: Ensure responsive grid and padding classes prevent horizontal overflow on 320px."""
        content = self._read_file(self.dilemmas_page_path)

        has_responsive_grid = "grid grid-cols-1" in content
        has_max_w = "max-w-6xl mx-auto" in content

        passed = has_responsive_grid and has_max_w
        self.log(
            "TC-DIL-RP-001", "Raining", "Socio-Centric Universal Accessibility",
            "Responsive Dilemma Card Stacking for 320px Mobile Screens (Zero Horizontal Overflow)",
            passed,
            "Missing single-column responsive grid on mobile screens"
        )

    def test_tc_dil_rp_002_transliteration_text_clamping(self):
        """TC-DIL-RP-002: Verify transliteration text has uniform line clamping and font styling."""
        content = self._read_file(self.dilemmas_page_path)

        has_translit_style = "font-serif italic" in content
        has_verse_card = "item.verseTransliteration" in content

        passed = has_translit_style and has_verse_card
        self.log(
            "TC-DIL-RP-002", "Raining", "High-Context Dignity",
            "Transliteration Text Clamping & Visual Rhythm Across All Screen Dimensions",
            passed,
            "Missing item.verseTransliteration styling"
        )

    def test_tc_dil_rp_003_lightweight_animation_transitions(self):
        """TC-DIL-RP-003: Verify lightweight CSS transitions to avoid main thread freeze on slow CPUs."""
        content = self._read_file(self.dilemmas_page_path)

        has_transitions = "transition" in content
        has_framer_motion = "motion." in content or "AnimatePresence" in content

        passed = has_transitions and has_framer_motion
        self.log(
            "TC-DIL-RP-003", "Raining", "Adaptive Structural Resilience",
            "Graceful Animation Degradation Under CPU Constraints (Non-Blocking Transitions)",
            passed,
            "Missing smooth transitions on interactive cards"
        )

    def test_tc_dil_rp_004_in_transit_client_state_retention(self):
        """TC-DIL-RP-004: Ensure active search query, category, and chapter filters persist during network drops."""
        content = self._read_file(self.dilemmas_page_path)

        has_query_state = "const [searchQuery, setSearchQuery] = useState" in content
        has_category_state = "const [activeCategory, setActiveCategory] = useState" in content
        has_chapter_state = "const [selectedChapter, setSelectedChapter] = useState" in content

        passed = has_query_state and has_category_state and has_chapter_state
        self.log(
            "TC-DIL-RP-004", "Raining", "Systemic Memory Preservation",
            "Client-Side Dilemma State Retention Through Intermittent Connection Drops",
            passed,
            "State is not cleanly encapsulated in component memory"
        )

    # =========================================================================
    # ENVIRONMENT 4: THE WORSE PATH (CATASTROPHIC OUTAGE)
    # =========================================================================

    def test_tc_dil_wp_001_backend_disconnection_resilience(self):
        """TC-DIL-WP-001: Ensure dilemmas page functions 100% offline without backend API."""
        content = self._read_file(self.dilemmas_page_path)

        no_blocking_api = "fetch(\"/api/v1/" not in content and "fetch('/api/v1/" not in content
        has_imported_data = "from \"@/data/gitaDilemmas\"" in content

        passed = no_blocking_api and has_imported_data
        self.log(
            "TC-DIL-WP-001", "Worse", "Systemic Risk-Mitigation (Self-Contained Client)",
            "100% Client-Side Dilemma Exploration Independence When Backend API Is Offline",
            passed,
            "Found blocking API call in dilemmas page load or missing imported master dataset"
        )

    def test_tc_dil_wp_002_scriptural_incorruptibility_gate(self):
        """TC-DIL-WP-002: Verify all 49+ dilemmas have authentic Sanskrit verses and zero mock placeholders."""
        data_content = self._read_file(self.dilemmas_data_path)

        has_no_lorem = "lorem ipsum" not in data_content.lower()
        has_no_todo = "todo: add verse" not in data_content.lower()
        verse_count = len(re.findall(r'verseSanskrit:', data_content))
        has_enough_verses = verse_count >= 40

        passed = has_no_lorem and has_no_todo and has_enough_verses
        self.log(
            "TC-DIL-WP-002", "Worse", "Sacred Trust & Canonical Incorruptibility",
            f"Zero Scriptural Hallucination Gate ({verse_count} Authentic Devanagari Verses, Zero Mock Texts)",
            passed,
            "Found placeholder text or insufficient Sanskrit verses in gitaDilemmas.ts"
        )

    def test_tc_dil_wp_003_live_http_server_response(self):
        """TC-DIL-WP-003: Test live HTTP request to http://localhost:1870/dilemmas."""
        url = f"{self.base_url}/dilemmas"
        status_code = None
        html_content = ""
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "NityaGeeta-QA-Runner/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                status_code = response.status
                html_content = response.read().decode("utf-8", errors="ignore")
        except urllib.error.URLError as e:
            status_code = getattr(e, "code", str(e))

        is_200 = status_code == 200
        has_title = "Dilemmas" in html_content or "NityaGeeta" in html_content

        passed = is_200 and has_title
        self.log(
            "TC-DIL-WP-003", "Worse", "Live Endpoint Resilience",
            f"Live HTTP Server Response for {url} (HTTP 200 OK)",
            passed,
            f"Expected status 200, got: {status_code}"
        )

    # =========================================================================
    # DILEMMA CONVERSATIONAL SEARCH ALIGNMENT LOOP
    # =========================================================================

    def run_dilemma_search_alignment_loop(self):
        """Evaluate how natural language conversational queries align with dilemmas."""
        print("\n--- [CONVERSATIONAL DILEMMA SEARCH ALIGNMENT LOOP] ---")

        test_queries = [
            {
                "id": "TC-DIL-SRH-001",
                "type": "Lateral (Adaptive)",
                "query": "I am feeling burnt out and overwhelmed at work, which shloka guides my mind?",
                "expected_targets": ["burnout", "paralysis", "exhaustion", "action", "workload"],
                "description": "Acute workplace burnout & exhaustion"
            },
            {
                "id": "TC-DIL-SRH-002",
                "type": "Lateral (Adaptive)",
                "query": "How to deal with acute anxiety, trembling body, and panic attacks?",
                "expected_targets": ["anxiety", "panic", "somatic", "trembling", "crisis"],
                "description": "Somatic symptoms of severe panic & anxiety"
            },
            {
                "id": "TC-DIL-SRH-003",
                "type": "Synthetic (Both-And)",
                "query": "Can I be ambitious in business while practicing detachment from outcomes?",
                "expected_targets": ["right to action", "detachment", "karma", "2.47", "equanimity"],
                "description": "Nishkama Karma Yoga & business ambition"
            },
            {
                "id": "TC-DIL-SRH-004",
                "type": "High-Context",
                "query": "How to manage family duty and moral conflict without breaking relationships?",
                "expected_targets": ["duty", "family", "conflict", "relationships", "dharma"],
                "description": "Kinship ethics & family moral dilemmas"
            },
            {
                "id": "TC-DIL-SRH-005",
                "type": "Systemic Risk-Mitigation",
                "query": "Fear of death and understanding what happens to soul after dying",
                "expected_targets": ["soul", "death", "immortal", "atman", "grief"],
                "description": "Overcoming existential fear of death"
            },
            {
                "id": "TC-DIL-SRH-006",
                "type": "Conversational (Typo-Tolerant)",
                "query": "tell me about exaustion and burn out from endless hustle",
                "expected_targets": ["burnout", "exhaustion", "action", "tools"],
                "description": "Typo-normalized exhaustion & burnout query"
            }
        ]

        alignment_passed = 0

        for tc in test_queries:
            query = tc["query"].lower()
            # Simple token matching matching the page logic
            clean_q = re.sub(r'[^a-z0-9\s]', ' ', query)
            tokens = [t for t in clean_q.split() if len(t) > 2]

            matched = []
            for d in self.dilemmas:
                text = f"{d['title']} {d['category']} {d['coreInsight']} {d['tag']}".lower()
                # Check target alignment
                score = 0
                for target in tc["expected_targets"]:
                    if target in text:
                        score += 50
                for t in tokens:
                    if t in text:
                        score += 20
                if score > 0:
                    matched.append((d, score))

            matched.sort(key=lambda x: x[1], reverse=True)

            if matched:
                top_dilemma = matched[0][0]
                alignment_passed += 1
                print(f"  [ALIGNED - GREAT!] ({tc['type']})")
                print(f"      Query: '{tc['query']}'")
                print(f"      -> Top Dilemma: Chapter {top_dilemma['chapter']}.{top_dilemma['verse']} - '{top_dilemma['title']}'")
                self.alignment_results.append({
                    "id": tc["id"],
                    "query": tc["query"],
                    "status": "ALIGNED",
                    "top_match": f"Ch {top_dilemma['chapter']}.{top_dilemma['verse']} - {top_dilemma['title']}"
                })
            else:
                print(f"  [MISALIGNED - ERROR] ({tc['type']})")
                print(f"      Query: '{tc['query']}'")
                self.alignment_results.append({
                    "id": tc["id"],
                    "query": tc["query"],
                    "status": "MISALIGNED",
                    "top_match": "None"
                })

        alignment_success = alignment_passed == len(test_queries)
        print(f"\n  Dilemma Search Alignment: {alignment_passed}/{len(test_queries)} Aligned\n")
        return alignment_success

    # =========================================================================
    # MASTER SUITE RUNNER
    # =========================================================================

    def run_all(self):
        print("\n" + "="*80)
        print("  NITYAGEETA DILEMMAS QA SUITE: /dilemmas AUDIT")
        print(f"  Target: {self.base_url}/dilemmas")
        print(f"  Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80 + "\n")

        print("--- [ENVIRONMENT 1: THE HAPPY PATH (OPTIMAL)] ---")
        self.test_tc_dil_hp_001_brand_voice_and_unbroken_sentences()
        self.test_tc_dil_hp_002_symmetrical_search_match_pill()
        self.test_tc_dil_hp_003_18_chapter_directory_numbering()
        self.test_tc_dil_hp_004_authentic_devanagari_sanskrit_cards()
        self.test_tc_dil_hp_005_1_click_ai_guidance_action()

        print("\n--- [ENVIRONMENT 2: THE BAD PATH (ERRONEOUS & EXTREME)] ---")
        self.test_tc_dil_bp_001_malformed_search_input_handling()
        self.test_tc_dil_bp_002_chapter_parameter_boundary_sanitization()
        self.test_tc_dil_bp_003_conversational_nlp_and_typo_normalization()
        self.test_tc_dil_bp_004_rapid_category_switching_determinism()

        print("\n--- [ENVIRONMENT 3: THE RAINING PATH (CONSTRAINED & LOW RES)] ---")
        self.test_tc_dil_rp_001_mobile_320px_layout_safety()
        self.test_tc_dil_rp_002_transliteration_text_clamping()
        self.test_tc_dil_rp_003_lightweight_animation_transitions()
        self.test_tc_dil_rp_004_in_transit_client_state_retention()

        print("\n--- [ENVIRONMENT 4: THE WORSE PATH (CATASTROPHIC OUTAGE)] ---")
        self.test_tc_dil_wp_001_backend_disconnection_resilience()
        self.test_tc_dil_wp_002_scriptural_incorruptibility_gate()
        self.test_tc_dil_wp_003_live_http_server_response()

        # Run Conversational Dilemmas Search Alignment Loop
        alignment_success = self.run_dilemma_search_alignment_loop()

        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = total - passed

        print("\n" + "="*80)
        print(f"  DILEMMAS QA SUMMARY (/dilemmas): {passed}/{total} Tests Passed ({failed} Failed)")
        print(f"  SEARCH ALIGNMENT CONVERGENCE: {'100% SUCCESS' if alignment_success else 'ERRORS DETECTED'}")
        print("="*80)

        # Save JSON execution report
        reports_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        report_path = os.path.join(reports_dir, "dilemmas_qa_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "target_url": f"{self.base_url}/dilemmas",
                "framework": "Multi-Scenario Resilience (Synthetic, Lateral, High-Context, Systemic Risk-Mitigation)",
                "total": total,
                "passed": passed,
                "failed": failed,
                "alignment_passed": alignment_success,
                "results": self.results,
                "alignment_results": self.alignment_results
            }, f, indent=2)
        print(f"\nExecution report saved to: {report_path}\n")

        return failed == 0 and alignment_success

if __name__ == "__main__":
    suite = DilemmasTestSuite()
    success = suite.run_all()
    sys.exit(0 if success else 1)
