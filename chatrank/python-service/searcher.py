"""
SerpApi integration for fetching search results.
"""
import os
import requests
from typing import List, Dict, Optional
from cache import cache

SERPAPI_KEY = os.getenv('SERPAPI_KEY')
SERPAPI_URL = 'https://serpapi.com/search'

def search_serpapi(query: str, num_results: int = 5) -> Dict:
    """
    Fetch search results from SerpApi.
    
    Returns:
        Dict with 'organic_results' list or 'no_results': True
    """
    if not SERPAPI_KEY:
        raise ValueError("SERPAPI_KEY environment variable not set")
    
    # Check cache first
    cached = cache.get('serpapi', query)
    if cached:
        return cached
    
    params = {
        'q': query,
        'api_key': SERPAPI_KEY,
        'engine': 'google',
        'num': num_results
    }
    
    try:
        response = requests.get(SERPAPI_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check for rate limit
        if 'error' in data:
            error_msg = data.get('error', 'Unknown error')
            if 'rate limit' in error_msg.lower() or '429' in str(data.get('status_code', '')):
                raise Exception("SerpApi rate limit reached. Please try again later.")
            raise Exception(f"SerpApi error: {error_msg}")
        
        # Cache the response
        cache.set('serpapi', query, data)
        
        return data
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch from SerpApi: {str(e)}")

def extract_organic_results(serpapi_response: Dict) -> List[Dict]:
    """
    Extract organic search results from SerpApi response.
    
    Returns:
        List of dicts with 'title', 'link', 'snippet', 'displayed_link'
    """
    if 'no_results' in serpapi_response and serpapi_response['no_results']:
        return []
    
    organic_results = serpapi_response.get('organic_results', [])
    
    results = []
    for item in organic_results:
        results.append({
            'title': item.get('title', 'No title'),
            'url': item.get('link', ''),
            'domain': item.get('displayed_link', item.get('link', '')),
            'snippet': item.get('snippet', ''),
            'raw_meta': {
                'position': item.get('position'),
                'date': item.get('date', ''),
                'source': item.get('source', '')
            }
        })
    
    return results

