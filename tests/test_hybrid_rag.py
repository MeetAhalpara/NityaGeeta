"""
tests/test_hybrid_rag.py
────────────────────────
Production-grade test suite for Hybrid RAG Engine and Citation Guardrail:
1. Deterministic verse citation regex parsing (e.g. 'BG 2.47').
2. BM25Okapi lexical retrieval with doc-length normalization.
3. Reciprocal Rank Fusion (RRF k=60) on conceptual queries.
4. Citation Validation Guardrail verifying grounded vs hallucinated citations.
"""

import pytest
from typing import List, Dict, Any

# Ensure dataset cache and verse index are loaded
import api.services.dataset_cache as dc
from api.services.verse_index import (
    parse_verse_citation,
    search_verses_hybrid,
    bm25_score_verses,
    reciprocal_rank_fusion,
    get_verse_index_size
)
from api.services.citation_guardrail import CitationGuardrail


# =============================================================================
# 1. Deterministic Citation Parser Tests
# =============================================================================

@pytest.mark.parametrize("query, expected_ch, expected_v", [
    ("BG 2.47", "2", "47"),
    ("What does BG 2.47 say?", "2", "47"),
    ("BG 2:47", "2", "47"),
    ("BG 2-47", "2", "47"),
    ("Bhagavad Gita 18.66 surrender unto me", "18", "66"),
    ("Gita 18.66", "18", "66"),
    ("Chapter 2, Verse 47", "2", "47"),
    ("Chapter 2 Verse 47", "2", "47"),
    ("chapter 18 verse 66", "18", "66"),
    ("Gita 2:47", "2", "47"),
    ("2.47 karma yoga", "2", "47"),
    ("18.66", "18", "66"),
])
def test_deterministic_citation_parsing_valid(query: str, expected_ch: str, expected_v: str):
    parsed = parse_verse_citation(query)
    assert parsed is not None, f"Failed to parse valid citation from '{query}'"
    assert parsed == (expected_ch, expected_v)


@pytest.mark.parametrize("query", [
    "How to deal with anxiety and grief?",
    "What is the meaning of karma?",
    "BG 19.1",          # Chapter 19 does not exist (Gita has 18 chapters)
    "Chapter 0 Verse 5", # Chapter 0 does not exist
    "BG 2.99",          # Verse 99 does not exist in Chapter 2
    "Who is Arjuna?",
])
def test_deterministic_citation_parsing_invalid(query: str):
    parsed = parse_verse_citation(query)
    assert parsed is None, f"Incorrectly parsed citation from non-citation query '{query}'"


# =============================================================================
# 2. Deterministic Exact Verse Lookup Tests
# =============================================================================

def test_exact_verse_deterministic_retrieval_bg_2_47():
    """Exact query 'BG 2.47' must return Chapter 2, Verse 47 with deterministic priority."""
    results = search_verses_hybrid("BG 2.47", top_k=1)
    assert len(results) == 1
    top = results[0]
    assert str(top.get("chapter")) == "2"
    assert str(top.get("verse")) == "47"
    assert top.get("retrieval_method") == "deterministic_citation"
    assert top.get("confidence") == 1.0
    assert "Chapter 2, Verse 47" in top.get("citation", "")


def test_exact_verse_deterministic_retrieval_gita_18_66():
    """Exact query 'Gita 18.66' must return Chapter 18, Verse 66 as rank 1."""
    results = search_verses_hybrid("Gita 18.66", top_k=1)
    assert len(results) == 1
    top = results[0]
    assert str(top.get("chapter")) == "18"
    assert str(top.get("verse")) == "66"
    assert top.get("retrieval_method") == "deterministic_citation"
    assert top.get("confidence") == 1.0


# =============================================================================
# 3. BM25Okapi and Reciprocal Rank Fusion (RRF) Tests
# =============================================================================

def test_bm25_scoring_and_rrf_on_conceptual_queries():
    """Conceptual queries must leverage BM25 and RRF rank fusion."""
    assert get_verse_index_size() > 500, "Verse index underpopulated!"

    query = "how to control restless mind and achieve equanimity"
    results = search_verses_hybrid(query, top_k=3)

    assert len(results) == 3
    for r in results:
        assert r.get("retrieval_method") == "rrf_hybrid"
        assert r.get("rrf_score", 0.0) > 0.0
        assert r.get("bm25_score", 0.0) >= 0.0
        assert len(r.get("english", "")) > 10

    # Verify RRF scores are sorted in strictly descending order
    scores = [r["rrf_score"] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_reciprocal_rank_fusion_math():
    """Verify standard RRF formula: sum 1 / (60 + rank)."""
    list_a = [(0, 10.0), (1, 8.0), (2, 5.0)]
    list_b = [(1, 9.0), (0, 7.0), (3, 4.0)]

    fused = reciprocal_rank_fusion([list_a, list_b], k=60)
    # Doc 0: 1/(60+1) + 1/(60+2) = 1/61 + 1/62 = 0.016393 + 0.016129 = 0.032522
    # Doc 1: 1/(60+2) + 1/(60+1) = 1/62 + 1/61 = 0.032522
    # Both 0 and 1 should dominate docs 2 and 3
    top_doc_ids = {fused[0][0], fused[1][0]}
    assert top_doc_ids == {0, 1}
    assert fused[0][1] > fused[2][1]


# =============================================================================
# 4. Citation Validation Guardrail Tests
# =============================================================================

def test_citation_guardrail_verified_grounded():
    """When the model cites a verse present in retrieved chunks, it is verified."""
    retrieved = [
        {"chapter": "2", "verse": "47", "citation": "Chapter 2, Verse 47"}
    ]
    response = (
        "In Bhagavad Gita, Lord Krishna advises in Chapter 2, Verse 47 that you have "
        "a right only to work, never to its fruits."
    )
    result = CitationGuardrail.validate_citations(response, retrieved)

    assert result["is_valid"] is True
    assert result["status"] == "VERIFIED"
    assert result["groundedness_score"] == 1.0
    assert result["verified_citations"] == ["2.47"]
    assert result["hallucinated_citations"] == []
    assert result["disclaimer"] is None


def test_citation_guardrail_detects_hallucination():
    """When the model hallucinates verses not in retrieved chunks, it is flagged."""
    retrieved = [
        {"chapter": "2", "verse": "47", "citation": "Chapter 2, Verse 47"}
    ]
    hallucinated_response = (
        "As explained in Chapter 4, Verse 13 and BG 9.22, one must cultivate devotion."
    )
    result = CitationGuardrail.validate_citations(hallucinated_response, retrieved)

    assert result["is_valid"] is False
    assert result["status"] == "HALLUCINATION_DETECTED"
    assert result["groundedness_score"] == 0.0
    assert result["verified_citations"] == []
    assert set(result["hallucinated_citations"]) == {"4.13", "9.22"}
    assert result["disclaimer"] is not None
    assert "Citation Warning" in result["sanitized_response"]


def test_citation_guardrail_partially_grounded():
    """When some citations match and others do not, report partially grounded."""
    retrieved = [
        {"chapter": "2", "verse": "47", "citation": "Chapter 2, Verse 47"}
    ]
    mixed_response = (
        "Krishna teaches selfless action in BG 2.47 and further expands in Chapter 3, Verse 19."
    )
    result = CitationGuardrail.validate_citations(mixed_response, retrieved)

    assert result["status"] == "PARTIALLY_GROUNDED"
    assert result["groundedness_score"] == 0.5
    assert result["verified_citations"] == ["2.47"]
    assert result["hallucinated_citations"] == ["3.19"]
    assert "Grounding Verification Notice" in result["sanitized_response"]


def test_citation_guardrail_no_citations():
    """Responses discussing general spiritual principles without citing numbers are valid."""
    retrieved = [
        {"chapter": "2", "verse": "47", "citation": "Chapter 2, Verse 47"}
    ]
    general_response = (
        "Focus on your present duty with dedication and equanimity. Do not be attached to outcomes."
    )
    result = CitationGuardrail.validate_citations(general_response, retrieved)

    assert result["is_valid"] is True
    assert result["status"] == "NO_CITATIONS_CLAIMED"
    assert result["groundedness_score"] == 1.0
    assert result["disclaimer"] is None
