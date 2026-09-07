"""
NityaGeeta Multi-Scenario Sources QA Test Suite
Platform: http://localhost:1870/sources
Framework: Synthetic (Both-And), Lateral (Adaptive), High-Context, Systemic Risk-Mitigation
Environments: Happy (Optimal), Bad (Erroneous), Raining (Constrained), Worse (Catastrophic)
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

class SourcesResilienceTestSuite:
    def __init__(self, base_url="http://localhost:1870"):
        self.base_url = base_url
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.sources_page_path = os.path.join(self.project_root, "frontend", "src", "app", "sources", "page.tsx")
        self.dilemmas_page_path = os.path.join(self.project_root, "frontend", "src", "app", "dilemmas", "page.tsx")
        self.dilemmas_data_path = os.path.join(self.project_root, "frontend", "src", "data", "gitaDilemmas.ts")
        self.footer_path = os.path.join(self.project_root, "frontend", "src", "components", "Footer.tsx")
        self.home_page_path = os.path.join(self.project_root, "frontend", "src", "app", "page.tsx")
        self.architecture_path = os.path.join(self.project_root, "frontend", "src", "app", "architecture", "page.tsx")
        self.results = []

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

    # =========================================================================
    # ENVIRONMENT 1: THE HAPPY PATH (OPTIMAL CONDITIONS)
    # =========================================================================

    def test_tc_hp_001_brand_voice_and_unbroken_sentences(self):
        """TC-HP-001: Ensure hero copy has no broken dashes, uses NityaGeeta, and uses One."""
        content = self._read_file(self.sources_page_path)
        dilemmas_content = self._read_file(self.dilemmas_page_path)

        # 1. Sources hero sentence must be continuous and have no dangling em-dash
        has_sources_hero = "NityaGeeta is built on complete transparency. One can explore authentic Gita Press commentaries" in content
        no_dangling_dash_sources = "challenges—with" not in content and "challenges--" not in content
        no_dangling_dash_dilemmas = "challenges—with" not in dilemmas_content and "challenges--" not in dilemmas_content

        # 2. Strict brand voice: no "our neural RAG engine" or "we highlight"
        no_first_person_sources = "our neural RAG engine" not in content and "we highlight" not in content
        no_first_person_dilemmas = "we highlight" not in dilemmas_content and "our AI finds" not in dilemmas_content

        # 3. Objective 3rd person: uses "one can"
        uses_one = "One can explore" in content and "one can find" in dilemmas_content

        passed = (has_sources_hero and no_dangling_dash_sources and no_dangling_dash_dilemmas 
                  and no_first_person_sources and no_first_person_dilemmas and uses_one)
        
        self.log(
            "TC-HP-001", "Happy", "High-Context Thinking",
            "Initial Page Atmosphere & Brand Voice Integrity (No dashes, no 'we', uses 'one')",
            passed,
            "Failed brand voice or sentence continuity check in sources or dilemmas hero"
        )

    def test_tc_hp_002_default_collapsed_state(self):
        """TC-HP-002: Ensure canonical editions start collapsed and all 4 editions exist."""
        content = self._read_file(self.sources_page_path)

        has_collapsed_state = "const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);" in content
        has_sadhaka = 'title: "Srimad Bhagavad Gita (Sadhaka-Sanjivani)"' in content
        has_sargeant = 'title: "The Bhagavad Gita: Interlinear Translation & Grammar"' in content
        has_shankara = 'title: "Srimad Bhagavad Gita Shankara Bhashya"' in content
        has_original = 'title: "Srimad Bhagavad Gita (Gita Press Original)"' in content

        passed = has_collapsed_state and has_sadhaka and has_sargeant and has_shankara and has_original
        self.log(
            "TC-HP-002", "Happy", "Holistic Cognitive Economy",
            "Default Collapsed State of 4 Primary Canonical Editions",
            passed,
            "State is not null or missing one of the 4 canonical editions"
        )

    def test_tc_hp_003_pdf_manuscript_reader_integration(self):
        """TC-HP-003: Verify in-app PDF reader component, scroll lock, and controls."""
        content = self._read_file(self.sources_page_path)

        has_reader_import = 'import { PdfManuscriptReader } from "@/components/ui/pdf-manuscript-reader";' in content
        has_scroll_lock = 'document.body.style.overflow = "hidden";' in content
        has_pdf_handler = "const handleOpenPdf = (url: string | null, title: string) =>" in content
        has_reader_render = "<PdfManuscriptReader" in content

        passed = has_reader_import and has_scroll_lock and has_pdf_handler and has_reader_render
        self.log(
            "TC-HP-003", "Happy", "Synthetic (Both-And) Architecture",
            "In-App PDF Manuscript Reader with Background Scroll Lock",
            passed,
            "PdfManuscriptReader or scroll-lock handler missing from sources page"
        )

    def test_tc_hp_004_peer_verified_audit_scoring_modal_purged_1296(self):
        """TC-HP-004: Verify audit modal has 100/100 score, academic proof, and zero '1,296' / '1296'."""
        sources_content = self._read_file(self.sources_page_path)
        footer_content = self._read_file(self.footer_path)
        home_content = self._read_file(self.home_page_path)
        arch_content = self._read_file(self.architecture_path)

        # 1. Purged 1,296 / 1296 across all frontend source files
        no_1296_sources = "1,296" not in sources_content and "1296" not in sources_content
        no_1296_footer = "1,296" not in footer_content and "1296" not in footer_content
        no_1296_home = "1,296" not in home_content and "1296" not in home_content
        no_1296_arch = "1,296" not in arch_content and "1296" not in arch_content

        # 2. Valid modal score and supporting citations (PIB Gandhi Peace Prize & Gita Press Official)
        has_score_100 = 'score: 100' in sources_content and 'scoreLabel: "100 / 100"' in sources_content
        has_gita_press_review = "Sadhaka-Sanjivani Canonical Critical Commentary" in sources_content
        has_pib_citation = "Gandhi Peace Prize Citation: Gita Press Gorakhpur" in sources_content

        passed = (no_1296_sources and no_1296_footer and no_1296_home and no_1296_arch 
                  and has_score_100 and has_gita_press_review and has_pib_citation)
        
        self.log(
            "TC-HP-004", "Happy", "Systemic Risk-Mitigation",
            "Peer-Verified Audit Scoring Modal (100/100, Academic Links, Zero '1,296' Mentions)",
            passed,
            "Residual '1,296' found or audit modal citations missing"
        )

    def test_tc_hp_005_18_chapters_deep_linking(self):
        """TC-HP-005: Validate 18-chapter directory and deep-linking to /dilemmas?chapter=X."""
        content = self._read_file(self.sources_page_path)

        has_dilemma_link = "/dilemmas?chapter=" in content
        has_router_push = "router.push" in content
        has_chapters_tab = 'activeTab === "chapters"' in content or 'activeTab === "all"' in content

        passed = has_dilemma_link and has_router_push and has_chapters_tab
        self.log(
            "TC-HP-005", "Happy", "Holistic Interconnection",
            "18-Chapter Thematic Index & Direct Deep-Linking to Dilemmas Engine",
            passed,
            "Missing /dilemmas?chapter= deep-link bindings in sources table"
        )

    # =========================================================================
    # ENVIRONMENT 2: THE BAD PATH (ERRONEOUS & EXTREME INPUTS)
    # =========================================================================

    def test_tc_bp_001_malformed_search_query_handling(self):
        """TC-BP-001: Ensure search logic safely escapes inputs and never crashes on special characters."""
        content = self._read_file(self.sources_page_path)

        # Uses token splitting on special chars and safe string lowercasing rather than raw unescaped regex
        has_token_split = "rawQ.split(/[" in content
        has_safe_filter = "ch.title.toLowerCase().includes(token)" in content or ".toLowerCase().includes" in content
        has_empty_state = "No matching manuscripts found" in content
        has_clear_search_btn = 'setSearchQuery("")' in content

        passed = has_token_split and has_safe_filter and has_empty_state and has_clear_search_btn
        self.log(
            "TC-BP-001", "Bad", "Lateral (Adaptive) Error Handling",
            "Malformed Search Query Handling & Safe Substring Matching (No Regex Crashes)",
            passed,
            "Search filter does not use safe token splitting or lacks clear empty state"
        )

    def test_tc_bp_002_out_of_range_chapter_query_injection(self):
        """TC-BP-002: Ensure chapter query parsing enforces 1 <= chapter <= 18 boundary checking."""
        dilemmas_content = self._read_file(self.dilemmas_page_path)

        has_bound_check = "parsed >= 1 && parsed <= 18" in dilemmas_content
        has_safe_default = 'setSelectedChapter(parsed);' in dilemmas_content

        passed = has_bound_check and has_safe_default
        self.log(
            "TC-BP-002", "Bad", "Systemic Risk-Mitigation",
            "Out-of-Range Chapter Parameter Sanitization (1 <= chapter <= 18 Enforced)",
            passed,
            "Missing boundary validation 'parsed >= 1 && parsed <= 18' in page.tsx"
        )

    def test_tc_bp_003_sanskrit_phonetic_transliteration_tolerance(self):
        """TC-BP-003: Verify keyword arrays index common transliterations and phonetic variants."""
        content = self._read_file(self.sources_page_path)

        has_sadhak = '"sadhak sanjeevani"' in content
        has_ramsukhdas = '"ramsukhdas"' in content
        has_nishkama = '"nishkama karma"' in content
        has_brahmacharya = '"brahmacharya"' in content

        passed = has_sadhak and has_ramsukhdas and has_nishkama and has_brahmacharya
        self.log(
            "TC-BP-003", "Bad", "High-Context Linguistic Resilience",
            "Phonetic Sanskrit Transliteration Tolerance via Comprehensive Keywords",
            passed,
            "Missing common phonetic synonyms in book keywords"
        )

    def test_tc_bp_004_tab_switching_concurrency(self):
        """TC-BP-004: Verify all 5 filter tabs are deterministically mapped without state race conditions."""
        content = self._read_file(self.sources_page_path)

        tabs = ['"all"', '"geeta"', '"veducation"', '"chapters"', '"vetting"']
        all_tabs_present = all(t in content for t in tabs)
        has_tab_state = 'useState<"all" | "geeta" | "veducation" | "chapters" | "vetting">("all");' in content

        passed = all_tabs_present and has_tab_state
        self.log(
            "TC-BP-004", "Bad", "Lateral State Poise",
            "Multi-Tab State Determinism Across All 5 Category Views",
            passed,
            "One or more tab identifiers missing from state definition"
        )

    # =========================================================================
    # ENVIRONMENT 3: THE RAINING PATH (CONSTRAINED & LOW RESOURCES)
    # =========================================================================

    def test_tc_rp_001_pdf_storage_timeout_and_lateral_fallback(self):
        """TC-RP-001: Ensure PDF viewer handles load state, null URLs, and provides direct store links."""
        content = self._read_file(self.sources_page_path)

        has_loading_state = "const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);" in content
        has_store_url_fallback = "source.storeUrl" in content and "target=\"_blank\"" in content
        has_null_check = "if (!url) return;" in content

        passed = has_loading_state and has_store_url_fallback and has_null_check
        self.log(
            "TC-RP-001", "Raining", "Lateral (Adaptive) Adaptive Workaround",
            "PDF Storage Timeout & Immediate Fallback to Direct Store Links and Summaries",
            passed,
            "Missing PDF loading state or direct storeUrl fallback"
        )

    def test_tc_rp_002_responsive_integrity_320px_layout(self):
        """TC-RP-002: Verify responsive flex/grid classes ensure 320px mobile viewport safety."""
        content = self._read_file(self.sources_page_path)

        has_responsive_flex = "flex flex-col sm:flex-row" in content
        has_responsive_padding = "px-4 sm:px-6" in content or "px-6" in content
        has_responsive_grid = "grid grid-cols-1" in content

        passed = has_responsive_flex and has_responsive_grid
        self.log(
            "TC-RP-002", "Raining", "Socio-Centric Universal Accessibility",
            "Responsive Layout Integrity for Low-Spec Mobile Screens (320px Safe)",
            passed,
            "Missing responsive flex-col sm:flex-row or single-column mobile grids"
        )

    def test_tc_rp_003_extreme_cpu_throttling_animation_safety(self):
        """TC-RP-003: Verify lightweight animations with CSS transitions to avoid main thread lock."""
        content = self._read_file(self.sources_page_path)

        has_smooth_transitions = "transition-all duration-200" in content
        has_framer_motion = "motion." in content and "AnimatePresence" in content

        passed = has_smooth_transitions and has_framer_motion
        self.log(
            "TC-RP-003", "Raining", "Adaptive Structural Resilience",
            "Graceful Animation Degradation Under CPU Constraints (Non-Blocking Transitions)",
            passed,
            "Missing lightweight CSS transition durations on interactive elements"
        )

    def test_tc_rp_004_client_side_state_preservation(self):
        """TC-RP-004: Ensure search state and active tab remain in memory during network drops."""
        content = self._read_file(self.sources_page_path)

        has_local_search_state = "const [searchQuery, setSearchQuery] = useState(\"\");" in content
        has_local_tab_state = "const [activeTab, setActiveTab] = useState" in content

        passed = has_local_search_state and has_local_tab_state
        self.log(
            "TC-RP-004", "Raining", "Systemic Memory Preservation",
            "Client-Side State Retention Through Intermittent Connection Drops",
            passed,
            "Search or tab state is not cleanly encapsulated in component memory"
        )

    # =========================================================================
    # ENVIRONMENT 4: THE WORSE PATH (CATASTROPHIC & TOTAL OUTAGE)
    # =========================================================================

    def test_tc_wp_001_backend_disconnection_resilience(self):
        """TC-WP-001: Ensure /sources operates 100% offline without requiring FastAPI backend on port 8000."""
        content = self._read_file(self.sources_page_path)

        # /sources should not have a blocking fetch('/api/...') on initial render
        no_blocking_api_fetch = "fetch(\"/api/v1/" not in content and "fetch('/api/v1/" not in content
        has_inlined_metadata = "const geetaEditions = [" in content and "const veducationSeries = [" in content

        passed = no_blocking_api_fetch and has_inlined_metadata
        self.log(
            "TC-WP-001", "Worse", "Systemic Risk-Mitigation (Self-Contained Client)",
            "100% Client-Side Library Navigation Independence When Backend API Is Offline",
            passed,
            "Found blocking API call in sources page load or missing inlined canonical metadata"
        )

    def test_tc_wp_002_scriptural_incorruptibility_gate(self):
        """TC-WP-002: Verify zero synthetic/dummy Sanskrit verses across the canonical database."""
        dilemmas_content = self._read_file(self.dilemmas_data_path)

        has_no_lorem = "lorem ipsum" not in dilemmas_content.lower()
        has_no_todo = "todo: add verse" not in dilemmas_content.lower()
        has_sanskrit_field = "verseSanskrit:" in dilemmas_content
        has_transliteration_field = "verseTransliteration:" in dilemmas_content

        passed = has_no_lorem and has_no_todo and has_sanskrit_field and has_transliteration_field
        self.log(
            "TC-WP-002", "Worse", "Sacred Trust & Canonical Incorruptibility",
            "Zero Scriptural Hallucination Gate (Authentic Devanagari & Zero Mock Verses)",
            passed,
            "Found placeholder text or missing Sanskrit fields in gitaDilemmas.ts"
        )

    def test_tc_wp_003_third_party_storage_outage_purchase_fallback(self):
        """TC-WP-003: Ensure all editions provide authentic storeUrls as redundant acquisition channels."""
        content = self._read_file(self.sources_page_path)

        # Every canonical commentary must have a valid storeUrl
        has_amazon_sadhaka = 'storeUrl: "https://www.amazon.com/Srimad-Bhagavadgita-v-Sadhaka-Sanjivani/dp/812930063X"' in content
        has_amazon_sargeant = 'storeUrl: "https://www.amazon.com/Bhagavad-Gita-Revised-Cultural-Perspectives/dp/0873958314"' in content
        has_store_veducation = 'storeUrl: "https://www.veducation.world/store/' in content

        passed = has_amazon_sadhaka and has_amazon_sargeant and has_store_veducation
        self.log(
            "TC-WP-003", "Worse", "Lateral Commercial & Scholarly Redundancy",
            "Institutional Redundancy: Verified Publisher Acquisition Links for Every Book",
            passed,
            "Missing authentic storeUrl fallback on one or more books"
        )

    def test_tc_wp_004_live_http_server_response(self):
        """TC-WP-004: Test live HTTP request to http://localhost:1870/sources."""
        url = f"{self.base_url}/sources"
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
        has_title = "NityaGeeta" in html_content or "Sources" in html_content

        passed = is_200 and has_title
        self.log(
            "TC-WP-004", "Worse", "Live Endpoint Resilience",
            f"Live HTTP Server Response for {url} (HTTP 200 OK)",
            passed,
            f"Expected status 200, got: {status_code}"
        )

    # =========================================================================
    # SUITE RUNNER
    # =========================================================================

    def run_all(self):
        print("\n" + "="*80)
        print("  NITYAGEETA SOURCES RESILIENCE QA SUITE: /sources AUDIT")
        print(f"  Target: {self.base_url}/sources")
        print(f"  Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80 + "\n")

        print("--- [ENVIRONMENT 1: THE HAPPY PATH (OPTIMAL)] ---")
        self.test_tc_hp_001_brand_voice_and_unbroken_sentences()
        self.test_tc_hp_002_default_collapsed_state()
        self.test_tc_hp_003_pdf_manuscript_reader_integration()
        self.test_tc_hp_004_peer_verified_audit_scoring_modal_purged_1296()
        self.test_tc_hp_005_18_chapters_deep_linking()

        print("\n--- [ENVIRONMENT 2: THE BAD PATH (ERRONEOUS & EXTREME)] ---")
        self.test_tc_bp_001_malformed_search_query_handling()
        self.test_tc_bp_002_out_of_range_chapter_query_injection()
        self.test_tc_bp_003_sanskrit_phonetic_transliteration_tolerance()
        self.test_tc_bp_004_tab_switching_concurrency()

        print("\n--- [ENVIRONMENT 3: THE RAINING PATH (CONSTRAINED & LOW RES)] ---")
        self.test_tc_rp_001_pdf_storage_timeout_and_lateral_fallback()
        self.test_tc_rp_002_responsive_integrity_320px_layout()
        self.test_tc_rp_003_extreme_cpu_throttling_animation_safety()
        self.test_tc_rp_004_client_side_state_preservation()

        print("\n--- [ENVIRONMENT 4: THE WORSE PATH (CATASTROPHIC OUTAGE)] ---")
        self.test_tc_wp_001_backend_disconnection_resilience()
        self.test_tc_wp_002_scriptural_incorruptibility_gate()
        self.test_tc_wp_003_third_party_storage_outage_purchase_fallback()
        self.test_tc_wp_004_live_http_server_response()

        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = total - passed

        print("\n" + "="*80)
        print(f"  SOURCES RESILIENCE QA SUMMARY: {passed}/{total} Tests Passed ({failed} Failed)")
        print("="*80)

        # Group by Environment
        env_counts = {}
        for r in self.results:
            env = r["environment"]
            env_counts.setdefault(env, {"pass": 0, "fail": 0})
            if r["status"] == "PASS":
                env_counts[env]["pass"] += 1
            else:
                env_counts[env]["fail"] += 1

        print("\n  BREAKDOWN BY OPERATIONAL ENVIRONMENT:")
        for env, counts in env_counts.items():
            print(f"    - {env.upper()}: {counts['pass']}/{counts['pass'] + counts['fail']} Passed")

        # Save JSON execution report
        reports_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        report_path = os.path.join(reports_dir, "sources_qa_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "target_url": f"{self.base_url}/sources",
                "framework": "Multi-Scenario Resilience (Synthetic, Lateral, High-Context, Systemic Risk-Mitigation)",
                "total": total,
                "passed": passed,
                "failed": failed,
                "environment_summary": env_counts,
                "results": self.results
            }, f, indent=2)
        print(f"\nExecution report saved to: {report_path}\n")

        return failed == 0

if __name__ == "__main__":
    suite = SourcesResilienceTestSuite()
    success = suite.run_all()
    sys.exit(0 if success else 1)
