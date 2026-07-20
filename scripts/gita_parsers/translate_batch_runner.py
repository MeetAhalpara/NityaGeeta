"""
scripts/gita_parsers/translate_batch_runner.py
NityaGeeta — Step-by-Step Batch Orchestrator for Large Page Ranges (Pages 200 to 1296)

Runs translation in configurable step-by-step chunks (e.g. 50 pages at a time)
to manage API rate limits, ensure progress persistence, and run post-processing
and shloka tag synchronization automatically after every step.

HOW TO RUN:
  # Translate from page 200 to 1296 in 50-page steps:
  python scripts/gita_parsers/translate_batch_runner.py --start 200 --end 1296 --step 50

  # Translate a specific chunk (e.g. 200 to 300 in 25-page steps):
  python scripts/gita_parsers/translate_batch_runner.py --start 200 --end 300 --step 25
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.gita_parsers.fix_gita_press_translation import run_translation
from scripts.gita_parsers.post_process_translations import clean_and_transliterate
from scripts.gita_parsers.inject_missing_shloka_tags import sync_all_shlokas

OUTPUT_PATH = Path("data/output/gita_editions/gita_press_translated.json")

def parse_args():
    parser = argparse.ArgumentParser(
        description="NityaGeeta — Step-by-Step Chunked Translation Runner (Pages 200 to End)"
    )
    parser.add_argument(
        "--start",
        type=int,
        default=200,
        help="Starting page number (default: 200)"
    )
    parser.add_argument(
        "--end",
        type=int,
        default=1296,
        help="Ending page number (default: 1296)"
    )
    parser.add_argument(
        "--step",
        type=int,
        default=50,
        help="Chunk size in pages per step (default: 50)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        default=False,
        help="Force re-translation of existing pages"
    )
    return parser.parse_args()


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    start_page = args.start
    end_page = args.end
    step_size = args.step
    force = args.force

    print("\n" + "═" * 75)
    print("  NITYAGEETA — Strict Gap-Free Sequential Batch Translation Orchestrator")
    print(f"  Target Page Range: {start_page} → {end_page} | Step Chunk Size: {step_size} pages")
    print("═" * 75)

    chunk_index = 1

    while True:
        # Load currently translated pages from output file
        existing_pages = set()
        if not force and OUTPUT_PATH.exists():
            try:
                with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                existing_pages = {item["page"] for item in data}
            except Exception:
                existing_pages = set()

        # Find all un-translated pages within target range
        missing = [p for p in range(start_page, end_page + 1) if p not in existing_pages]

        if not missing:
            print(f"\n  🎉 All pages from {start_page} to {end_page} are 100% TRANSLATED and saved!")
            break

        current_start = missing[0]
        current_end = min(current_start + step_size - 1, end_page)

        print("\n" + "─" * 75)
        print(f"  🚀 BATCH {chunk_index}: Translating Pages {current_start} → {current_end} ({len(missing)} missing pages remaining overall)")
        print("─" * 75)

        # Execute translation for chunk
        completed_ok = False
        try:
            completed_ok = run_translation(current_start, current_end, force=force)
        except Exception as err:
            print(f"  ❌ Exception during batch ({current_start}-{current_end}): {err}")

        # Execute post-processing and shloka tag alignment after chunk
        print("\n  Cleaning Devanagari transliteration & aligning shloka tags...")
        try:
            clean_and_transliterate()
            sync_all_shlokas()
        except Exception as post_err:
            print(f"  ⚠️ Post-processing warning: {post_err}")

        if completed_ok:
            print(f"  ✅ BATCH {chunk_index} COMPLETE ({current_start} → {current_end})")
        else:
            print(f"  ⚠️ BATCH {chunk_index} paused due to API limits. Will resume from page {current_start} after brief rest...")
            time.sleep(10.0)

        chunk_index += 1
        time.sleep(2.0)

    print("\n" + "═" * 75)
    print("  🎉 STEP-BY-STEP BATCH TRANSLATION COMPLETED")
    print("═" * 75 + "\n")


if __name__ == "__main__":
    main()
