"""
Fetch and extract text content from web pages.
"""
import requests
from bs4 import BeautifulSoup
from typing import Optional, Dict
from cache import cache
import re

# Try to import newspaper3k, but handle if it fails (e.g., lxml compatibility issues)
try:
    from newspaper import Article
    NEWSPAPER_AVAILABLE = True
except ImportError as e:
    NEWSPAPER_AVAILABLE = False
    print(f"[FETCHER] newspaper3k not available: {e}. Using BeautifulSoup only.")

def fetch_and_extract(url: str) -> Dict[str, Optional[str]]:
    """
    Fetch a webpage and extract its text content.
    
    Returns:
        Dict with 'text' (extracted content) and 'snippet' (first paragraph)
    """
    # Check cache first
    cached = cache.get('page_text', url)
    if cached:
        return cached
    
    # Try newspaper3k first if available
    if NEWSPAPER_AVAILABLE:
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            if article.text and len(article.text.strip()) > 100:
                text = preprocess_text(article.text)
                snippet = extract_snippet(text, 300)
                
                result = {
                    'text': text,
                    'snippet': snippet,
                    'preview_unavailable': False
                }
                cache.set('page_text', url, result)
                return result
        except Exception as e:
            print(f"[FETCHER] newspaper3k failed for {url}: {str(e)}")
    
    # Fallback to BeautifulSoup
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=3)  # Very short timeout
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text from main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('body')
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
            text = preprocess_text(text)
            
            if len(text.strip()) > 100:
                snippet = extract_snippet(text, 300)
                result = {
                    'text': text,
                    'snippet': snippet,
                    'preview_unavailable': False
                }
                cache.set('page_text', url, result)
                return result
    except Exception as e:
        print(f"[FETCHER] BeautifulSoup fallback failed for {url}: {str(e)}")
    
    # If all extraction methods fail
    result = {
        'text': None,
        'snippet': None,
        'preview_unavailable': True
    }
    cache.set('page_text', url, result)
    return result

def preprocess_text(text: str) -> str:
    """
    Preprocess text: lowercase, remove excessive whitespace.
    Keep content intact, just normalize.
    """
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove excessive whitespace but keep single spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text

def extract_snippet(text: str, max_length: int = 300) -> Optional[str]:
    """
    Extract a snippet from text (first relevant passage).
    """
    if not text:
        return None
    
    # Take first max_length characters, but try to end at sentence boundary
    if len(text) <= max_length:
        return text
    
    snippet = text[:max_length]
    # Try to find last sentence boundary
    last_period = snippet.rfind('.')
    last_exclamation = snippet.rfind('!')
    last_question = snippet.rfind('?')
    
    last_boundary = max(last_period, last_exclamation, last_question)
    if last_boundary > max_length * 0.5:  # Only use boundary if it's not too early
        snippet = snippet[:last_boundary + 1]
    else:
        snippet = snippet.rstrip() + "..."
    
    return snippet

