"""
Gemini LLM integration for generating AI answers.
"""
import os
from typing import Optional

import google.generativeai as genai

from cache import cache

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')


class GeminiUnavailable(Exception):
    """Raised when Gemini cannot provide an answer."""


def initialize_gemini():
    """Initialize Gemini API client."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=GEMINI_API_KEY)


def get_ai_answer(query: str) -> str:
    """
    Get a 1-2 paragraph AI answer from Gemini for the query.
    Raises GeminiUnavailable if Gemini cannot respond.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    # Check cache
    cached = cache.get('gemini', query)
    if cached:
        return cached

    try:
        initialize_gemini()
        model = genai.GenerativeModel('models/gemini-2.0-flash')

        prompt = (
            "You are writing a concise explanation for a student researching a topic.\n"
            f"Topic: {query}\n\n"
            "Write 1-2 short paragraphs (3-6 sentences total) that:\n"
            "- Define or describe the topic clearly\n"
            "- Mention key facts or important points\n"
            "- Encourage the reader to verify details in reliable sources\n"
            "Keep the tone educational and easy to understand."
        )

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "max_output_tokens": 256,
            },
        )

        answer = (response.text or "").strip()
        if not answer:
            raise GeminiUnavailable("Gemini returned an empty response.")

        # Add source suggestion
        answer += "\n\nReview the search results below for sources and additional context."

        # Cache the answer
        cache.set('gemini', query, answer)

        return answer
    except GeminiUnavailable:
        raise
    except Exception as e:
        error_msg = str(e)
        lower_err = error_msg.lower()
        if any(keyword in lower_err for keyword in ["dns", "timeout", "503", "network", "unavailable"]):
            raise GeminiUnavailable("Gemini API network timeout or DNS error.") from e
        raise GeminiUnavailable(f"Gemini API error: {error_msg}") from e
