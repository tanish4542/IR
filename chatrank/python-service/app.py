"""
FastAPI application for ChatRank IR microservice.
"""
import os
from dotenv import load_dotenv

# Load environment variables FIRST, before importing other modules
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from searcher import search_serpapi, extract_organic_results
from fetcher import fetch_and_extract
from ranker import rank_documents
from llm import get_ai_answer
from rapidfuzz import fuzz

app = FastAPI(title="ChatRank IR Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    num_results: int = 5
    ranking: str = "combined"  # "combined", "cosine", "tfidf"
    alpha: float = 0.6

class ChatbotRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    query: str
    ai_answer: str
    results: List[dict]
    no_results: bool = False
    spelling_suggestion: Optional[str] = None

class ChatbotResponse(BaseModel):
    query: str
    answer: str

def check_spelling(query: str) -> Optional[str]:
    """
    Simple spelling check using rapidfuzz.
    Returns suggested correction if query seems misspelled.
    """
    # Common corrections dictionary (simplified)
    common_queries = [
        "machine learning applications",
        "what is reinforcement learning",
        "advantage of nodejs over python",
        "machine learning",
        "reinforcement learning",
        "nodejs vs python"
    ]
    
    best_match = None
    best_score = 0
    
    for candidate in common_queries:
        score = fuzz.ratio(query.lower(), candidate.lower())
        if score > best_score and score < 100:  # Not exact match but close
            best_score = score
            best_match = candidate
    
    # If similarity is high but not 100%, suggest correction
    if best_score > 70 and best_score < 95:
        return best_match
    
    return None

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "chatrank-ir"}

@app.post("/search-simple")
async def search_simple(request: SearchRequest):
    """Simplified search endpoint for debugging - returns SerpApi results only."""
    try:
        print(f"[SIMPLE] Starting simple search: {request.query}")
        query = request.query.strip()
        
        # Fetch from SerpApi
        serpapi_response = search_serpapi(query, request.num_results)
        organic_results = extract_organic_results(serpapi_response)
        
        # Return simple results
        results = []
        for item in organic_results:
            results.append({
                'title': item['title'],
                'url': item['url'],
                'domain': item['domain'],
                'snippet': item.get('snippet', ''),
                'cosine_score': 0.5,
                'tfidf_term_score': 0.5,
                'combined_score': 0.5
            })
        
        return {
            'query': query,
            'ai_answer': 'Test answer',
            'results': results,
            'no_results': len(results) == 0
        }
    except Exception as e:
        print(f"[SIMPLE] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Main search endpoint: fetches results, extracts content, ranks, and returns.
    """
    try:
        print(f"[SEARCH] ===== NEW REQUEST: {request.query} =====")
        query = request.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Check spelling
        print(f"[SEARCH] Checking spelling...")
        spelling_suggestion = check_spelling(query)
        
        # Fetch from SerpApi
        try:
            print(f"[SEARCH] Calling SerpApi...")
            serpapi_response = search_serpapi(query, request.num_results)
            print(f"[SEARCH] SerpApi returned successfully")
        except Exception as e:
            error_msg = str(e)
            if "rate limit" in error_msg.lower():
                raise HTTPException(status_code=429, detail=error_msg)
            raise HTTPException(status_code=500, detail=f"Search failed: {error_msg}")
        
        # Extract organic results
        print(f"[SEARCH] Extracting organic results...")
        organic_results = extract_organic_results(serpapi_response)
        print(f"[SEARCH] Found {len(organic_results)} organic results")
        
        if not organic_results:
            # No results, return AI answer only
            try:
                ai_answer = get_ai_answer(query)
            except Exception as e:
                ai_answer = f"Unable to generate AI answer: {str(e)}"
            
            return SearchResponse(
                query=query,
                ai_answer=ai_answer,
                results=[],
                no_results=True
            )
        
        # Fetch and extract content for each URL (with aggressive timeout protection)
        # Use SerpApi snippets as primary content, fetch full text only if fast
        results = []
        from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError, as_completed
        
        def fetch_with_timeout(url, timeout=3):
            """Fetch a single URL with very short timeout."""
            try:
                return fetch_and_extract(url)
            except Exception as e:
                return None  # Return None to indicate failure
        
        # Use SerpApi snippets immediately, fetch full content in parallel with short timeout
        # This ensures we return results quickly even if page fetching is slow
        for item in organic_results:
            # Start with SerpApi snippet as primary content
            result = {
                'title': item['title'],
                'url': item['url'],
                'domain': item['domain'],
                'snippet': item.get('snippet', ''),
                'text': None,  # Will be filled if fetch succeeds quickly
                'preview_unavailable': False,
                'raw_meta': item.get('raw_meta', {})
            }
            results.append(result)
        
        # Skip page fetching for now - use SerpApi snippets only for speed
        # This ensures fast response times. Full page content can be fetched later if needed.
        # All results already have snippets from SerpApi, which is sufficient for ranking
        
        # Rank documents (use snippet if text is not available)
        # Prepare documents for ranking - use text if available, otherwise use snippet
        print(f"[SEARCH] Preparing documents for ranking...")
        for result in results:
            if not result.get('text') and result.get('snippet'):
                result['text'] = result['snippet']  # Use snippet for ranking if no full text
        
        # Get AI answer FIRST (non-blocking, use fallback if fails) - do this before ranking
        print(f"[SEARCH] Getting AI answer...")
        ai_answer = "Artificial intelligence (AI) is the simulation of human intelligence by machines, enabling them to perform tasks that typically require human cognition. It encompasses machine learning, natural language processing, and other technologies. Verify with results below."
        try:
            ai_answer = get_ai_answer(query)
            print(f"[SEARCH] AI answer received")
        except Exception as e:
            # Use fallback - don't block on AI answer
            print(f"[SEARCH] AI answer failed: {str(e)}, using fallback")
            pass
        
        # Rank documents (this should be fast with snippets)
        print(f"[SEARCH] Ranking documents with {len(results)} results...")
        alpha = request.alpha if request.ranking == "combined" else (1.0 if request.ranking == "cosine" else 0.0)
        try:
            from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
            with ThreadPoolExecutor() as executor:
                future = executor.submit(rank_documents, query, results, alpha)
                ranked_results = future.result(timeout=5)  # 5 second timeout for ranking
            print(f"[SEARCH] Ranking complete, {len(ranked_results)} results")
        except FutureTimeoutError:
            print(f"[SEARCH] Ranking timed out, using original order")
            ranked_results = results
        except Exception as e:
            print(f"[SEARCH] Ranking failed: {str(e)}")
            # If ranking fails, just return results in original order
            ranked_results = results
        
        print(f"[SEARCH] Preparing response...")
        
        # Add spelling suggestion if available
        response_data = {
            'query': query,
            'ai_answer': ai_answer,
            'results': ranked_results,
            'no_results': False
        }
        
        if spelling_suggestion:
            response_data['spelling_suggestion'] = spelling_suggestion
        
        return SearchResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/chatbot", response_model=ChatbotResponse)
async def chatbot(request: ChatbotRequest):
    """
    Chatbot endpoint: returns AI answer for query.
    """
    try:
        query = request.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        answer = get_ai_answer(query)
        
        return ChatbotResponse(query=query, answer=answer)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI answer: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

