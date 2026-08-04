"""
llm_client.py
─────────────
5-model ensemble using genuinely different AI models across two providers.

Brain assignments (confirmed working 2026-08-03):
  M1 — Groq       llama-3.3-70b-versatile            Primary Gita Synthesis
  M2 — OpenRouter  deepseek/deepseek-chat-v3-0324     Advaita Non-Dual (DeepSeek V3)
  M3 — OpenRouter  mistralai/mistral-small-3.1-24b    Practical Sadhana (Mistral)
  M4 — OpenRouter  google/gemma-3-12b-it              Scientific / Cosmic (Gemma)
  M5 — OpenRouter  openai/gpt-4o-mini                 Cognitive / Psychological (GPT)

Judge  — Groq llama-3.1-8b-instant  (fast, cheap)
Synth  — Groq llama-3.3-70b-versatile

Pipeline per request:
  1. All 5 Brains fire in parallel → 5 answers
  2. Judge picks the best (Mx)
  3. Cross-model synthesis: "Mx is the base — what unique insight do the other 4 add?"
  4. Web search already ran in parallel
  5. Dual-source synthesis: scripture answer + web → final response
"""

import os
import json
import logging
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from groq import Groq

from api.config import (
    GROQ_API_KEYS, DEFAULT_MODEL, FALLBACK_MODEL,
    OPENROUTER_API_KEY,
    OPENROUTER_BRAIN2_MODEL, OPENROUTER_BRAIN3_MODEL,
    OPENROUTER_BRAIN4_MODEL, OPENROUTER_BRAIN5_MODEL,
)
from api.services.prompt_builder import (
    JUDGE_SYSTEM_PROMPT,
    SCRIPTURE_SYSTEM_PROMPT,
    BRAIN1_SYSTEM_PROMPT,
    BRAIN2_SYSTEM_PROMPT,
    BRAIN3_SYSTEM_PROMPT,
    BRAIN4_SYSTEM_PROMPT,
    BRAIN5_SYSTEM_PROMPT,
    BRAIN6_SYSTEM_PROMPT,
    build_judge_prompt,
    build_cross_model_synthesis_prompt,
    build_dual_source_synthesis_prompt,
)

logger = logging.getLogger("nityageeta.llm_client")

# ── Groq key rotation ────────────────────────────────────────────────────────
_groq_key_index = 0

def _next_groq_client() -> Groq:
    global _groq_key_index
    if not GROQ_API_KEYS:
        raise ValueError("No Groq API keys configured.")
    key = GROQ_API_KEYS[_groq_key_index % len(GROQ_API_KEYS)]
    _groq_key_index += 1
    return Groq(api_key=key)

# keep old name so nothing else breaks
def get_next_groq_client():
    global _groq_key_index
    if not GROQ_API_KEYS:
        raise ValueError("No Groq API keys configured.")
    key = GROQ_API_KEYS[_groq_key_index % len(GROQ_API_KEYS)]
    indicator = f"Key #{(_groq_key_index % len(GROQ_API_KEYS)) + 1}"
    _groq_key_index += 1
    return Groq(api_key=key), indicator


# ── Low-level callers ────────────────────────────────────────────────────────

async def _call_groq(
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.3,
    system_prompt: Optional[str] = None,
    max_tokens: int = 900,
) -> str:
    """Call Groq with automatic key rotation and retry."""
    built: List[Dict[str, str]] = []
    if system_prompt:
        built.append({"role": "system", "content": system_prompt})
        built += [m for m in messages if m.get("role") != "system"]
    else:
        built = list(messages)

    for attempt in range(max(len(GROQ_API_KEYS), 1)):
        try:
            client = _next_groq_client()
            loop = asyncio.get_running_loop()
            completion = await loop.run_in_executor(
                None,
                lambda c=client: c.chat.completions.create(
                    model=model,
                    messages=built,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            )
            text = completion.choices[0].message.content
            if text and text.strip():
                return text.strip()
        except Exception as e:
            logger.warning(f"Groq attempt {attempt+1} failed ({model}): {e}")
            await asyncio.sleep(0.2)

    return "Unable to retrieve response from Groq."


async def _call_openrouter(
    messages: List[Dict[str, str]],
    model: str = OPENROUTER_BRAIN2_MODEL,
    temperature: float = 0.3,
    system_prompt: Optional[str] = None,
    max_tokens: int = 900,
) -> str:
    """
    Call any model available on OpenRouter.
    Falls back to Groq DEFAULT_MODEL if OpenRouter fails or key is missing.
    """
    if not OPENROUTER_API_KEY:
        logger.warning("OPENROUTER_API_KEY not set — falling back to Groq.")
        return await _call_groq(messages, model=DEFAULT_MODEL, temperature=temperature,
                                system_prompt=system_prompt, max_tokens=max_tokens)

    built: List[Dict[str, str]] = []
    if system_prompt:
        built.append({"role": "system", "content": system_prompt})
        built += [m for m in messages if m.get("role") != "system"]
    else:
        built = list(messages)

    payload = {
        "model": model,
        "messages": built,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "NityaGeeta",
    }

    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["choices"][0]["message"]["content"]
                    if text and text.strip():
                        return text.strip()
                else:
                    err = resp.json().get("error", {}).get("message", resp.text[:120])
                    logger.warning(f"OpenRouter {model} HTTP {resp.status_code}: {err}")
        except Exception as e:
            logger.warning(f"OpenRouter {model} attempt {attempt+1} failed: {e}")
            await asyncio.sleep(0.3)

    # Graceful fallback to Groq so the ensemble always gets 5 answers
    logger.warning(f"OpenRouter {model} failed — falling back to Groq.")
    return await _call_groq(messages, model=DEFAULT_MODEL, temperature=temperature,
                            system_prompt=system_prompt, max_tokens=max_tokens)


# Keep old name used elsewhere
async def _call_groq_with_persona(
    messages: List[Dict[str, str]],
    model_name: str = DEFAULT_MODEL,
    temperature: float = 0.3,
    system_prompt: Optional[str] = None,
    perspective_prompt: Optional[str] = None,
) -> str:
    if perspective_prompt and messages:
        messages = list(messages)
        messages[-1] = dict(messages[-1])
        messages[-1]["content"] = (
            f"{perspective_prompt}\n\nQuestion Context:\n{messages[-1]['content']}"
        )
    return await _call_groq(messages, model=model_name, temperature=temperature,
                            system_prompt=system_prompt)


# ── 5-model parallel ensemble ─────────────────────────────────────────────────

async def generate_5_model_parallel_responses(
    messages: List[Dict[str, str]],
    boss_context: str = "",
) -> List[Dict[str, Any]]:
    """
    Fire all 6 Brains simultaneously using genuinely different models.

    M1 Groq  llama-3.3-70b        — Primary Gita Synthesis
    M2 OR    DeepSeek V3           — Advaita Non-Dual
    M3 OR    Mistral Small 24B     — Practical Sadhana & Duty
    M4 OR    Google Gemma 3 12B    — Scientific & Cosmic
    M5 OR    OpenAI GPT-4o mini    — Cognitive & Psychological
    M6 Groq  llama-3.1-8b         — Sanatan Sanskriti (BOSS book)
    """
    logger.info("Dispatching 6-model parallel ensemble (Groq + OpenRouter + BOSS)...")

    # M6: if BOSS context was found, prepend it to the user message
    boss_messages = messages
    if boss_context:
        boss_messages = list(messages)
        # Inject BOSS context into the user message
        last = dict(boss_messages[-1])
        last["content"] = (
            f"=== BOSS SANATAN SANSKRITI CONTEXT ===\n{boss_context}\n\n"
            + last["content"]
        )
        boss_messages = boss_messages[:-1] + [last]

    tasks = [
        (
            "Scriptural Wisdom",
            _call_groq(
                messages, model=DEFAULT_MODEL, temperature=0.2,
                system_prompt=BRAIN1_SYSTEM_PROMPT,
            ),
        ),
        (
            "Advaita & Self-Inquiry",
            _call_openrouter(
                messages, model=OPENROUTER_BRAIN2_MODEL, temperature=0.2,
                system_prompt=BRAIN2_SYSTEM_PROMPT,
            ),
        ),
        (
            "Karma Yoga & Daily Practice",
            _call_openrouter(
                messages, model=OPENROUTER_BRAIN3_MODEL, temperature=0.3,
                system_prompt=BRAIN3_SYSTEM_PROMPT,
            ),
        ),
        (
            "Cosmic & Universal Laws",
            _call_openrouter(
                messages, model=OPENROUTER_BRAIN4_MODEL, temperature=0.3,
                system_prompt=BRAIN4_SYSTEM_PROMPT,
            ),
        ),
        (
            "Mind & Psychology",
            _call_openrouter(
                messages, model=OPENROUTER_BRAIN5_MODEL, temperature=0.3,
                system_prompt=BRAIN5_SYSTEM_PROMPT,
            ),
        ),
        (
            "Sanatan Sanskriti (BOSS)",
            _call_groq(
                boss_messages, model=FALLBACK_MODEL, temperature=0.2,
                system_prompt=BRAIN6_SYSTEM_PROMPT,
            ),
        ),
    ]

    names, coros = zip(*tasks)
    results = await asyncio.gather(*coros, return_exceptions=True)

    candidates: List[Dict[str, Any]] = []
    for name, res in zip(names, results):
        if isinstance(res, Exception):
            logger.error(f"{name} raised exception: {res}")
            response_text = f"Model error: {res}"
        else:
            response_text = str(res)
        candidates.append({"model_name": name, "response": response_text})
        logger.info(f"  {name[:50]} — {len(response_text)} chars received")

    return candidates


# ── Judge ─────────────────────────────────────────────────────────────────────

async def evaluate_and_judge_responses(
    query: str,
    retrieved_context: str,
    candidate_responses: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Judge evaluates all 5 candidates and picks the best one.
    Uses fast Groq 8B model to keep latency low.
    """
    logger.info("Judge evaluating 5 candidate responses...")
    judge_prompt = build_judge_prompt(query, retrieved_context, candidate_responses)
    judge_messages = [
        {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
        {"role": "user",   "content": judge_prompt},
    ]

    raw = await _call_groq(judge_messages, model=FALLBACK_MODEL, temperature=0.1, max_tokens=600)

    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Judge JSON parse failed: {e} — using fallback scoring.")
        scorecards = [
            {
                "model_name": c["model_name"],
                "score": 96 - i * 2,
                "groundedness_score": 9, "citation_score": 9, "clarity_score": 9,
                "feedback": "Auto-scored.",
            }
            for i, c in enumerate(candidate_responses)
        ]
        return {
            "winning_model": candidate_responses[0]["model_name"],
            "best_score": 96,
            "reasoning": "Auto-selected first candidate.",
            "scorecards": scorecards,
        }

# alias used by rag_engine
evaluate_with_judge_model = evaluate_and_judge_responses


# ── Cross-model synthesis ─────────────────────────────────────────────────────

async def synthesize_cross_model_responses(
    query: str,
    winning_model_name: str,
    winning_response: str,
    candidate_responses: List[Dict[str, Any]],
) -> str:
    """
    Takes the Judge's winning answer (Mx) and enriches it with the best
    unique insights from the other 4 models — anything Mx missed.
    """
    logger.info(f"Cross-model synthesis: enriching winner ({winning_model_name[:40]})...")
    synth_prompt = build_cross_model_synthesis_prompt(
        query=query,
        winning_model_name=winning_model_name,
        winning_response=winning_response,
        other_candidates=candidate_responses,
    )
    messages = [
        {"role": "system", "content": SCRIPTURE_SYSTEM_PROMPT},
        {"role": "user",   "content": synth_prompt},
    ]
    return await _call_groq(messages, model=DEFAULT_MODEL, temperature=0.2)


# ── Dual-source synthesis ─────────────────────────────────────────────────────

async def synthesize_dual_source_response(
    query: str,
    scripture_synthesized_answer: str,
    web_results: List[Dict[str, Any]],
) -> str:
    """
    Final step: merge the enriched scripture answer with live web search results.
    Produces the response the user actually sees.
    """
    logger.info("Dual-source synthesis: scripture + web...")
    web_context = "\n".join(
        f"- [{r.get('source','Web')}]: {r.get('snippet','')}"
        for r in web_results
        if r.get("snippet")
    )
    dual_prompt = build_dual_source_synthesis_prompt(
        query=query,
        scripture_synthesized_answer=scripture_synthesized_answer,
        web_context=web_context,
    )
    messages = [
        {"role": "system", "content": SCRIPTURE_SYSTEM_PROMPT},
        {"role": "user",   "content": dual_prompt},
    ]
    return await _call_groq(messages, model=DEFAULT_MODEL, temperature=0.2)


# ── Query expansion (verse search fallback) ───────────────────────────────────

async def expand_query_for_gita(question: str) -> List[str]:
    """
    Translates any question into Gita-domain keywords for verse index search.
    Uses the fast 8B model — adds ~0.5s only when verse search confidence is low.
    """
    prompt = (
        f'A user asked: "{question}"\n\n'
        "List 8 single English words describing this question's themes using "
        "Bhagavad Gita concepts. Output only comma-separated words, nothing else.\n"
        "Example: duty, desire, attachment, action, grief, liberation, ego, karma"
    )
    try:
        raw = await _call_groq(
            messages=[{"role": "user", "content": prompt}],
            model=FALLBACK_MODEL,
            temperature=0.1,
            system_prompt=(
                "You translate life questions into Bhagavad Gita vocabulary. "
                "Output only comma-separated single words."
            ),
            max_tokens=60,
        )
        words = [w.strip().lower() for w in raw.replace("\n", ",").split(",")]
        words = [w for w in words if w.isalpha() and len(w) >= 3]
        logger.info(f"Query expansion: {words}")
        return words[:10]
    except Exception as e:
        logger.warning(f"Query expansion failed: {e}")
        return []
