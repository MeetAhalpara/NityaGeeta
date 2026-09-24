"""
citation_guardrail.py
─────────────────────
Production-grade Citation Validation Guardrail for NityaGeeta.

Validates that scripture citations claimed in LLM responses (e.g., 'Chapter 2, Verse 47',
'BG 2.47', 'Bhagavad Gita 18.66') are grounded in the retrieved verse chunks.
Detects and flags model hallucinations before responses reach the user.
"""

import re
import logging
from typing import List, Dict, Any, Tuple, Set, Optional

logger = logging.getLogger("nityageeta.citation_guardrail")


class CitationGuardrail:
    """
    Validates that scripture citations claimed in generated AI responses
    correspond directly to retrieved, ground-truth scripture chunks.
    """

    @staticmethod
    def extract_citations(text: str) -> List[Tuple[str, str]]:
        """
        Extracts all canonical (chapter, verse) tuples cited within text.
        Handles forms like:
          - 'BG 2.47', 'BG 2:47', 'BG 2-47'
          - 'Chapter 2, Verse 47', 'Chapter 2 Verse 47'
          - 'Bhagavad Gita 18.66', 'Gita 18.66'
          - 'Shloka 2.47', 'Verse 2.47'
        """
        if not text:
            return []

        citations: Set[Tuple[str, str]] = set()

        # Pattern 1: Explicit book/chapter prefix with verse
        # e.g., 'BG 2.47', 'Gita 2:47', 'Chapter 2, Verse 47'
        p1 = re.finditer(
            r'(?:(?:bg|gita|bhagavad\s*gita|chapter|chap\.?|ch\.?)\s*)'
            r'(\b\d{1,2}\b)[\s\.\:\,\-v]+(?:verse|shloka|sloka)?\s*(\b\d{1,3}\b)',
            text, re.IGNORECASE
        )
        for m in p1:
            ch, v = m.group(1), m.group(2)
            if 1 <= int(ch) <= 18 and 1 <= int(v) <= 78:
                citations.add((str(int(ch)), str(int(v))))

        # Pattern 2: "Chapter X Verse Y" or "Chapter X, Verse Y"
        p2 = re.finditer(
            r'chapter\s*(\b\d{1,2}\b)\s*(?:,\s*)?(?:verse|shloka|sloka)\s*(\b\d{1,3}\b)',
            text, re.IGNORECASE
        )
        for m in p2:
            ch, v = m.group(1), m.group(2)
            if 1 <= int(ch) <= 18 and 1 <= int(v) <= 78:
                citations.add((str(int(ch)), str(int(v))))

        # Pattern 3: Explicit Shloka/Verse X.Y (e.g. "Verse 2.47", "Shloka 18.66")
        p3 = re.finditer(
            r'(?:verse|shloka|sloka)\s*(\b\d{1,2}\b)[\.\:](\b\d{1,3}\b)',
            text, re.IGNORECASE
        )
        for m in p3:
            ch, v = m.group(1), m.group(2)
            if 1 <= int(ch) <= 18 and 1 <= int(v) <= 78:
                citations.add((str(int(ch)), str(int(v))))

        return sorted(list(citations), key=lambda x: (int(x[0]), int(x[1])))

    @classmethod
    def validate_citations(
        cls,
        response_text: str,
        retrieved_verses: List[Dict[str, Any]],
        strict: bool = False
    ) -> Dict[str, Any]:
        """
        Validates claimed scripture citations in response_text against ground-truth retrieved_verses.

        Returns:
            Dict containing:
              - is_valid: bool
              - status: 'VERIFIED' | 'PARTIALLY_GROUNDED' | 'HALLUCINATION_DETECTED' | 'NO_CITATIONS_CLAIMED'
              - groundedness_score: float (0.0 to 1.0)
              - total_claimed: int
              - verified_citations: List of "Ch.V" strings
              - hallucinated_citations: List of "Ch.V" strings
              - ground_truth_available: List of "Ch.V" strings
              - disclaimer: Optional warning string if unverified citations are detected
              - sanitized_response: Response text (with disclaimer appended if applicable)
        """
        claimed = cls.extract_citations(response_text)
        claimed_keys = [f"{ch}.{v}" for ch, v in claimed]

        # Extract available ground truth verse keys
        ground_truth_set: Set[str] = set()
        for rv in (retrieved_verses or []):
            ch = str(rv.get("chapter", "")).strip()
            vs = str(rv.get("verse", "")).strip()
            if ch and vs and ch.isdigit() and vs.isdigit():
                ground_truth_set.add(f"{int(ch)}.{int(vs)}")
            # Also check citation string if chapter/verse weren't isolated
            cit_str = rv.get("citation", "")
            if cit_str:
                for parsed_ch, parsed_v in cls.extract_citations(cit_str):
                    ground_truth_set.add(f"{int(parsed_ch)}.{int(parsed_v)}")

        ground_truth_list = sorted(list(ground_truth_set), key=lambda x: [int(p) for p in x.split('.')])

        # Case 1: No specific verse numbers claimed in text
        if not claimed_keys:
            return {
                "is_valid": True,
                "status": "NO_CITATIONS_CLAIMED",
                "groundedness_score": 1.0,
                "total_claimed": 0,
                "verified_citations": [],
                "hallucinated_citations": [],
                "ground_truth_available": ground_truth_list,
                "disclaimer": None,
                "sanitized_response": response_text
            }

        verified = [k for k in claimed_keys if k in ground_truth_set]
        hallucinated = [k for k in claimed_keys if k not in ground_truth_set]

        score = len(verified) / len(claimed_keys) if claimed_keys else 1.0

        if not hallucinated:
            status = "VERIFIED"
            is_valid = True
            disclaimer = None
            sanitized = response_text
        elif verified:
            status = "PARTIALLY_GROUNDED"
            is_valid = not strict
            missing_str = ", ".join(f"Chapter {h.split('.')[0]} Verse {h.split('.')[1]}" for h in hallucinated)
            disclaimer = (
                f"\n\n> **Grounding Verification Notice**: The citation(s) [{missing_str}] "
                f"were referenced by the model but were not part of the active ground-truth scripture chunks "
                f"retrieved for this prompt."
            )
            sanitized = response_text + disclaimer
        else:
            status = "HALLUCINATION_DETECTED"
            is_valid = False
            missing_str = ", ".join(f"Chapter {h.split('.')[0]} Verse {h.split('.')[1]}" for h in hallucinated)
            disclaimer = (
                f"\n\n> **Citation Warning**: The cited verse(s) [{missing_str}] could not be verified "
                f"against the retrieved authentic scripture text."
            )
            sanitized = response_text + disclaimer

        logger.info(
            f"Citation Guardrail evaluation: status={status}, score={round(score, 2)}, "
            f"verified={verified}, hallucinated={hallucinated}"
        )

        return {
            "is_valid": is_valid,
            "status": status,
            "groundedness_score": round(score, 2),
            "total_claimed": len(claimed_keys),
            "verified_citations": verified,
            "hallucinated_citations": hallucinated,
            "ground_truth_available": ground_truth_list,
            "disclaimer": disclaimer,
            "sanitized_response": sanitized
        }
