import logging
import asyncio
import re
from typing import Dict, Any, List
from api.services.dataset_cache import search_all_datasets, search_verses, search_boss_context
from api.services.web_search import search_web_async
from api.services.prompt_builder import (
    SCRIPTURE_SYSTEM_PROMPT,
    build_rag_context_block,
    build_verse_context_block,
    build_scripture_user_prompt
)
from api.services.llm_client import (
    generate_5_model_parallel_responses,
    evaluate_with_judge_model,
    synthesize_cross_model_responses,
    synthesize_dual_source_response,
    expand_query_for_gita
)

logger = logging.getLogger("nityageeta.rag_engine")
logging.basicConfig(level=logging.INFO)

def sanitize_response_tone(text: str) -> str:
    """Safeguard cleaner removing patronizing terms, rigid robotic headers, and markdown symbol noise."""
    if not text:
        return text
    # Remove patronizing endearments (including any trailing comma/period and space that follows)
    cleaned = re.sub(r'(?i)\b(my\s+dear\s+child|my\s+child|my\s+dear\s+seeker|oh\s+dear|dear\s+child|dear\s+seeker)[,\.]?\s*', '', text)
    # If the removal left a leading comma/semicolon fragment at the start, clean it up
    cleaned = re.sub(r'^[,;]\s*([a-z])', lambda m: m.group(1).upper(), cleaned)
    # Remove trailing Om Shanti
    cleaned = re.sub(r'(?i)\b(om\s+shanti)[,\.]?\s*$', '', cleaned)
    cleaned = re.sub(r'(?i)\b(om\s+shanti)[,\.]?\s*\n', '\n', cleaned)
    # Remove rigid section titles
    cleaned = re.sub(r'(?i)\*\*(?:Spiritual Explanation & Guidance|Sacred Gita Verse & Transliteration|Wisdom of the Acharyas & Commentaries|Practical Daily Application|Core Scriptural Guidance|Wisdom of the Acharyas|Advaita Non-Dual Metaphysics|Wisdom of Shankara & Atman Realization|Practical Sadhana & Daily Discipline|Actionable Karma Yoga Steps|Universal Energy & Physics Connections|Cosmic Cause-and-Effect Analysis|Cognitive Psychology & Reframing|Neuroscience & Mind Resilience Steps)\*\*\n?', '', cleaned)
    # Strip markdown hashes and symbol noise
    cleaned = re.sub(r'^###+\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned)
    return cleaned.strip()


async def execute_rag_pipeline_async(question: str) -> Dict[str, Any]:
    """Executes full prioritized 4-dataset RAG search, 5-model parallel execution, Judge evaluation,
    cross-model synthesis, live web search, and dual-source authorized synthesis."""
    logger.info(f"Initiating Multi-Model RAG pipeline for query: '{question}'")

    # ── Step 1a: Verse-level search (primary) ────────────────────────────────
    # Find the most relevant individual shlokas from the verse index
    matched_verses = search_verses(question, top_k=3)
    logger.info(f"Verse index returned {len(matched_verses)} relevant shlokas.")

    # ── Step 1b: Smart fallback — if confidence is low, expand via LLM ───────
    # Score is considered low when we got fewer than 2 verses OR the best verse
    # was found only via broad stem-matching (no direct keyword hit).
    # We run expansion in the background; it adds ~0.5s on a fast model.
    if len(matched_verses) < 2:
        logger.info("Low verse confidence — expanding query via LLM...")
        expanded_terms = await expand_query_for_gita(question)
        if expanded_terms:
            expanded_query = question + " " + " ".join(expanded_terms)
            expanded_verses = search_verses(expanded_query, top_k=3)
            if len(expanded_verses) >= len(matched_verses):
                matched_verses = expanded_verses
                logger.info(f"Expanded search returned {len(matched_verses)} verses.")

    # ── Step 1b: Page-level search (supplementary commentary) ────────────────
    retrieved_items = search_all_datasets(question, top_per_dataset=1)

    # ── Step 1c: Build combined context block ────────────────────────────────
    # Verse context comes first — the LLM must use these exact verses
    verse_context_text   = build_verse_context_block(matched_verses)
    page_context_text    = build_rag_context_block(retrieved_items)

    retrieved_context_text = verse_context_text
    if page_context_text and page_context_text != "No direct scripture context retrieved.":
        retrieved_context_text += "\n\n--- SUPPLEMENTARY COMMENTARY PAGES ---\n" + page_context_text

    # ── Step 1d: Build scripture citations from verse results ─────────────────
    scripture_citations = []
    for v in matched_verses:
        scripture_citations.append({
            "type": "scripture",
            "priority": 1,
            "source": v.get("source", ""),
            "page": v.get("page", 0),
            "chapter": v.get("chapter", ""),
            "verse": v.get("verse", ""),
            "citation": v.get("citation", ""),
            "sanskrit": v.get("sanskrit", "")[:250],
            "translation": v.get("english", "")[:250],
            "score": 100,
        })
    # Also include page-level citations as fallback
    for item in retrieved_items:
        scripture_citations.append({
            "type": "scripture",
            "priority": item["priority"],
            "source": item["source"],
            "page": item["page"],
            "sanskrit": item.get("original", "")[:250] if item.get("original") else "",
            "translation": (item.get("english") or item.get("text", ""))[:250],
            "score": item["score"]
        })

    # ── Step 2: Build messages for 6-model parallel dispatch ─────────────────
    user_prompt = build_scripture_user_prompt(question, retrieved_context_text)
    messages = [
        {"role": "system", "content": SCRIPTURE_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]

    # ── Step 2b: Search BOSS book for M6 context (runs fast, in-memory) ──────
    boss_context = search_boss_context(question, top_k=3)
    logger.info(f"BOSS context: {len(boss_context)} chars retrieved.")

    # ── Step 3: 6-model parallel + live web search concurrently ──────────────
    models_task = generate_5_model_parallel_responses(messages, boss_context=boss_context)
    web_task = search_web_async(question, max_results=4)

    candidate_responses, web_results = await asyncio.gather(models_task, web_task)

    web_citations = []
    for item in web_results:
        web_citations.append({
            "type": "web",
            "priority": 1,
            "source": item.get("source", "Web Search"),
            "title": item.get("title", ""),
            "snippet": item.get("snippet", ""),
            "url": item.get("url", ""),
            "score": 95
        })

    # Add BOSS as a named resource citation if it contributed context
    if boss_context:
        scripture_citations.insert(0, {
            "type": "scripture",
            "priority": 0,
            "source": "Basics of Sanatan Sanskriti (BOSS)",
            "page": 0,
            "chapter": "",
            "verse": "",
            "citation": "BOSS — Sanatan Sanskriti Foundation",
            "sanskrit": "",
            "translation": "Foundational knowledge of Soul, God, Dharma, Karma, Yoga, Cosmos and Time.",
            "score": 90,
        })

    # ── Step 4: Judge evaluation ──────────────────────────────────────────────
    judge_result = await evaluate_with_judge_model(
        query=question,
        retrieved_context=retrieved_context_text,
        candidate_responses=candidate_responses
    )

    winning_model_name = judge_result.get("winning_model", "Groq Llama 3.3 70B")

    winning_answer_text = ""
    for cand in candidate_responses:
        if cand["model_name"] == winning_model_name:
            winning_answer_text = cand["response"]
            break

    if not winning_answer_text and candidate_responses:
        winning_answer_text = candidate_responses[0]["response"]

    # ── Step 5: Cross-model synthesis ────────────────────────────────────────
    scripture_synthesized_answer = await synthesize_cross_model_responses(
        query=question,
        winning_model_name=winning_model_name,
        winning_response=winning_answer_text,
        candidate_responses=candidate_responses
    )

    # ── Step 6: Dual-source synthesis (scripture + web) ──────────────────────
    dual_authorized_answer = await synthesize_dual_source_response(
        query=question,
        scripture_synthesized_answer=scripture_synthesized_answer,
        web_results=web_results
    )

    # ── Step 7: Tone sanitization ─────────────────────────────────────────────
    final_answer = sanitize_response_tone(dual_authorized_answer)

    combined_citations = scripture_citations + web_citations

    return {
        "answer": final_answer,
        "winning_model": winning_model_name,
        "best_score": judge_result.get("best_score", 95),
        "reasoning": judge_result.get("reasoning", "Evaluated as highest quality scripturally grounded answer."),
        "scorecards": judge_result.get("scorecards", []),
        "candidates": candidate_responses,
        "scripture_citations": scripture_citations,
        "web_citations": web_citations,
        "citations": combined_citations
    }

def execute_rag_query(question: str) -> Dict[str, Any]:
    """Synchronous wrapper for FastAPI endpoint compatibility."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return asyncio.run_coroutine_threadsafe(execute_rag_pipeline_async(question), loop).result()
        return loop.run_until_complete(execute_rag_pipeline_async(question))
    except Exception:
        return asyncio.run(execute_rag_pipeline_async(question))

