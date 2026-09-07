"""
Automated QA Test Suite for NityaGeeta Platform
Validates:
1. Canonical Bhagavad Gita Corpus Data Integrity (18 Chapters, 700 Verses)
2. Sources Page Architecture & Clean Metadata (/sources)
3. Life Dilemmas Engine & Interactive Directory Table (/dilemmas)
4. Symmetrical Match Pill UX & Accessibility Standards
"""

import os
import sys
import re
import json
from datetime import datetime

# Configure UTF-8 safe output for Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

class NityaGeetaQASuite:
    def __init__(self):
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.sources_page_path = os.path.join(self.project_root, "frontend", "src", "app", "sources", "page.tsx")
        self.dilemmas_page_path = os.path.join(self.project_root, "frontend", "src", "app", "dilemmas", "page.tsx")
        self.dilemmas_data_path = os.path.join(self.project_root, "frontend", "src", "data", "gitaDilemmas.ts")
        self.results = []

    def log_test(self, test_id, name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        self.results.append({
            "test_id": test_id,
            "name": name,
            "status": status,
            "details": details
        })
        icon = "[PASS]" if passed else "[FAIL]"
        print(f"{icon} {test_id}: {name} -> {status}")
        if not passed and details:
            print(f"    Error: {details}")

    def test_sources_default_collapsed(self):
        """TC-SRC-001: Ensure Book 1 starts closed by default (expandedSourceId is null)."""
        with open(self.sources_page_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        has_null_default = 'const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);' in content
        self.log_test(
            "TC-SRC-001",
            "Sources: Book 1 default collapsed on initial load",
            has_null_default,
            "expandedSourceId state must default to null"
        )

    def test_sources_no_veducation_world(self):
        """TC-SRC-007: Verify (Veducation.world) text is removed from all book card headers."""
        with open(self.sources_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find the veducationSeries definition
        match = re.search(r"const veducationSeries = \[(.*?)\];\s*const geetaCommentaries", content, re.DOTALL)
        if not match:
            # Try alternate slice
            start = content.find("const veducationSeries = [")
            end = content.find("];", start)
            ved_block = content[start:end] if start != -1 and end != -1 else ""
        else:
            ved_block = match.group(1)

        has_ved_world = "(Veducation.world)" in ved_block
        self.log_test(
            "TC-SRC-007",
            "Sources: Subtitle text omits '(Veducation.world)' across Veducation series",
            not has_ved_world,
            "Found residual '(Veducation.world)' in veducationSeries metadata"
        )

    def test_sources_veducation_beta_disclaimers(self):
        """TC-SRC-004: Verify Vedic Dincharya and Brahmacharya have Beta disclaimers and empty chapters."""
        with open(self.sources_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        has_ved2_notice = 'id: "ved-2"' in content and 'Translation from Hindi / Sanskrit to English is currently in progress.' in content
        has_ved3_notice = 'id: "ved-3"' in content and 'Beta Version • Translation in Progress' in content
        self.log_test(
            "TC-SRC-004",
            "Sources: Vedic Dincharya & Brahmacharya show Beta Translation in Progress notice",
            has_ved2_notice and has_ved3_notice,
            "Missing translationNotice for ved-2 or ved-3"
        )

    def test_sources_bundle_books_format(self):
        """TC-SRC-005: Verify 5-in-1 bundle lists books as '1. BookName' without prices and keeps FREE Bonus."""
        with open(self.sources_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        has_1_boss = '1. B.O.S.S : Basics of Sanatan Sanskriti' in content
        has_2_dincharya = '2. Vedic Dincharya' in content
        has_3_brahmacharya = '3. Brahmacharya : The Ultimate Action Book' in content
        has_free_bonus = '+ 2 Free Surprise Gift Books' in content and 'FREE Bonus' in content
        
        # Verify no MRP prices inside bundleBooks
        bundle_start = content.find("bundleBooks: [")
        bundle_end = content.find("],", bundle_start)
        bundle_block = content[bundle_start:bundle_end] if bundle_start != -1 else ""
        no_mrp_in_bundle = "MRP =" not in bundle_block

        passed = has_1_boss and has_2_dincharya and has_3_brahmacharya and has_free_bonus and no_mrp_in_bundle
        self.log_test(
            "TC-SRC-005",
            "Sources: 5-in-1 Master Bundle formatted as '1. BookName' with only FREE Bonus kept",
            passed,
            "Bundle formatting or pricing assertion failed"
        )

    def test_sources_bundle_redundancy_eliminated(self):
        """TC-SRC-006: Verify duplicate overview and why-included boxes are hidden for 5-in-1 pack."""
        with open(self.sources_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        has_conditional = "{!source.bundleBooks && (" in content
        self.log_test(
            "TC-SRC-006",
            "Sources: Redundant overview and why-included blocks hidden for 5-in-1 bundle",
            has_conditional,
            "Expected {!source.bundleBooks && (...)} wrapping overview boxes"
        )

    def test_dilemmas_search_pill_with_x(self):
        """TC-DIL-001: Ensure dilemmas search bar renders symmetrical match count pill with X icon."""
        with open(self.dilemmas_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        has_match_text = "{filteredDilemmas.length} {filteredDilemmas.length === 1 ? \"match\" : \"matches\"}" in content
        has_x_icon = "<X className=\"w-3 h-3\" />" in content
        has_x_import = re.search(r"import\s*\{[^}]*\bX\b[^}]*\}\s*from\s*\"lucide-react\"", content) is not None

        passed = has_match_text and has_x_icon and has_x_import
        self.log_test(
            "TC-DIL-001",
            "Dilemmas: Search bar displays real-time match pill and X icon button",
            passed,
            "Missing match count text or X icon in search pill"
        )

    def test_dilemmas_chapter_table_plain_numbers(self):
        """TC-DIL-003: Verify table renders clean chapter numbers (1, 2, 3...) under Chapter column."""
        with open(self.dilemmas_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        has_plain_ch = "{ch.num}" in content
        has_redundant_text = "Chapter {ch.num.toString().padStart(2, \"0\")}" in content

        passed = has_plain_ch and not has_redundant_text
        self.log_test(
            "TC-DIL-003",
            "Dilemmas: 18-Chapter directory table displays clean numbers (1, 2, 3...) under Chapter",
            passed,
            "Table still contains redundant 'Chapter 01' text under Chapter column"
        )

    def test_canonical_corpus_700_verses(self):
        """TC-COR-001: Validate all 18 chapters exist in GITA_CHAPTERS_INFO and total 700 verses."""
        with open(self.dilemmas_data_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find all verse counts
        verse_matches = re.findall(r"verses:\s*(\d+)", content)
        if verse_matches:
            # Take the first 18 which belong to GITA_CHAPTERS_INFO
            counts = [int(v) for v in verse_matches[:18]]
            total_verses = sum(counts)
            passed = len(counts) == 18 and total_verses in (700, 701)
            self.log_test(
                "TC-COR-001",
                f"Corpus: Canonical tally of 18 chapters and {total_verses} verses (canonical 700 / 701 with Ch 13.1)",
                passed,
                f"Counted {len(counts)} chapters and {total_verses} verses"
            )
        else:
            self.log_test("TC-COR-001", "Corpus: Canonical tally verification", False, "Could not extract chapter verse counts")

    def run_all(self):
        print("\n" + "="*70)
        print("  NITYAGEETA AUTOMATED SOFTWARE TESTING & QUALITY ASSURANCE (QA) SUITE")
        print(f"  Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70 + "\n")

        self.test_sources_default_collapsed()
        self.test_sources_no_veducation_world()
        self.test_sources_veducation_beta_disclaimers()
        self.test_sources_bundle_books_format()
        self.test_sources_bundle_redundancy_eliminated()
        self.test_dilemmas_search_pill_with_x()
        self.test_dilemmas_chapter_table_plain_numbers()
        self.test_canonical_corpus_700_verses()

        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = total - passed

        print("\n" + "-"*70)
        print(f"  QA SUMMARY: {passed}/{total} Tests Passed ({failed} Failed)")
        print("-"*70 + "\n")

        # Save JSON execution report
        reports_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        report_path = os.path.join(reports_dir, "test_execution_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total": total,
                "passed": passed,
                "failed": failed,
                "results": self.results
            }, f, indent=2)
        print(f"Execution report saved to: {report_path}\n")

        return failed == 0

if __name__ == "__main__":
    suite = NityaGeetaQASuite()
    success = suite.run_all()
    sys.exit(0 if success else 1)
