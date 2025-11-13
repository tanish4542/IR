"""
Gemini LLM integration for generating AI answers.
"""
import os
import google.generativeai as genai
from typing import Optional
from cache import cache

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def initialize_gemini():
    """Initialize Gemini API client."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=GEMINI_API_KEY)

def get_ai_answer(query: str) -> str:
    """
    Get a 2-3 sentence AI answer from Gemini for the query.
    
    Returns:
        String with AI answer
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    # Check cache
    cached = cache.get('gemini', query)
    if cached:
        return cached
    
    try:
        initialize_gemini()
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""Provide a concise 2-3 sentence explanation about: {query}

Keep the answer educational and suitable for students. Be clear and informative."""
        
        # Generate content (Gemini API handles timeouts internally)
        response = model.generate_content(prompt)
        answer = response.text.strip()
        
        # Add source suggestion
        answer += " Verify with results below."
        
        # Cache the answer
        cache.set('gemini', query, answer)
        
        return answer
    except Exception as e:
        # Return a fallback message instead of raising
        error_msg = str(e)
        if "DNS" in error_msg or "timeout" in error_msg.lower():
            return f"AI answer temporarily unavailable. {query} is a topic that can be explored through the search results below."
        raise Exception(f"Failed to get AI answer: {str(e)}")

