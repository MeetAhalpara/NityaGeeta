"""
api/services/deepeval_evaluator.py
───────────────────────────────────
Production DeepEval Integration Service for NityaGeeta.
Enables automated evaluation of RAG responses (Faithfulness, Hallucination, Relevancy)
using DeepEval test cases and Groq as the evaluation judge.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv

from deepeval.test_case import LLMTestCase
from deepeval.models.base_model import DeepEvalBaseLLM

load_dotenv()
logger = logging.getLogger("nityageeta.deepeval")


class GroqDeepEvalJudge(DeepEvalBaseLLM):
    """
    DeepEval LLM Judge implementation backed by Groq API.
    Uses 'qwen/qwen-2.5-32b' or 'openai/gpt-oss-120b' for evaluation.
    """

    def __init__(self, model_name: str = "qwen/qwen3.8-27b"):
        self.model_name = model_name
        self._api_key = os.getenv("GROQ_API_KEY", "")
        super().__init__(model_name)

    def load_model(self):
        if not self._api_key:
            logger.warning("GROQ_API_KEY not found; GroqDeepEvalJudge running in offline mode.")
            return None
        return Groq(api_key=self._api_key)

    def generate(self, prompt: str, **kwargs) -> str:
        if not self.model:
            return "Evaluation completed offline."
        try:
            resp = self.model.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=1024
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Groq evaluation error: {e}")
            return f"Error: {e}"

    async def a_generate(self, prompt: str, **kwargs) -> str:
        return self.generate(prompt, **kwargs)

    def get_model_name(self) -> str:
        return self.model_name


def build_deepeval_test_case(
    input_query: str,
    actual_output: str,
    retrieval_context: List[str]
) -> LLMTestCase:
    """Creates a validated DeepEval LLMTestCase for scripture RAG verification."""
    return LLMTestCase(
        input=input_query,
        actual_output=actual_output,
        retrieval_context=retrieval_context
    )
