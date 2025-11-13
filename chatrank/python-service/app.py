"""
FastAPI application for ChatRank IR microservice.
"""
import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
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
from llm import get_ai_answer, GeminiUnavailable
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

def generate_summary_from_results(query: str, results: List[dict], reason: Optional[str] = None) -> str:
    """Generate a brief summary from ranked search results when Gemini is unavailable."""
    top_results = []
    for result in results:
        snippet = result.get('snippet') or result.get('text')
        if snippet:
            top_results.append((result.get('title', 'Result'), snippet))
        if len(top_results) >= 3:
            break

    if top_results:
        source_insights = " ".join(f"{title}: {snippet}" for title, snippet in top_results)
        summary = (
            f"Here's what the top sources say about '{query}': {source_insights}"
        )
        summary += "\n\nUse the search results below to read the full articles and verify the details."
    else:
        summary = (
            f"An AI summary for '{query}' isn't available right now. Please review the search results below for detailed information."
        )

    if reason:
        trimmed_reason = reason if len(reason) <= 120 else reason[:117] + "..."
        summary += f"\n\n(Gemini couldn't provide an answer automatically: {trimmed_reason})"

    return summary

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
        except ValueError as e:
            error_msg = str(e)
            if "SERPAPI_KEY" in error_msg or "GEMINI_API_KEY" in error_msg:
                raise HTTPException(
                    status_code=503, 
                    detail=f"Service configuration error: {error_msg}. Please check your .env file and ensure API keys are set."
                )
            raise HTTPException(status_code=400, detail=error_msg)
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
            except ValueError as e:
                error_msg = str(e)
                if "GEMINI_API_KEY" in error_msg:
                    ai_answer = f"AI answer unavailable: {error_msg}. Please check your .env file and ensure GEMINI_API_KEY is set."
                else:
                    ai_answer = f"Unable to generate AI answer: {error_msg}"
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

        # Rank documents (this should be fast with snippets)
        print(f"[SEARCH] Ranking documents with {len(results)} results...")
        alpha = request.alpha if request.ranking == "combined" else (1.0 if request.ranking == "cosine" else 0.0)
        try:
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

        print(f"[SEARCH] Getting AI answer...")
        ai_answer = None
        ai_error = None

        def fetch_ai_answer():
            return get_ai_answer(query)

        try:
            with ThreadPoolExecutor() as executor:
                future = executor.submit(fetch_ai_answer)
                ai_answer = future.result(timeout=5)
            print(f"[SEARCH] AI answer received")
        except FutureTimeoutError:
            ai_error = "Gemini request timed out after 5 seconds."
            print(f"[SEARCH] AI answer timed out")
        except GeminiUnavailable as e:
            ai_error = "Gemini service was unavailable."
            print(f"[SEARCH] Gemini unavailable: {e}")
        except Exception as e:
            ai_error = "Unexpected error while requesting Gemini."
            print(f"[SEARCH] AI answer failed: {e}")

        if not ai_answer:
            ai_answer = generate_summary_from_results(query, ranked_results, ai_error)

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

    except ValueError as e:
        error_msg = str(e)
        if "GEMINI_API_KEY" in error_msg:
            raise HTTPException(
                status_code=503,
                detail=f"Service configuration error: {error_msg}. Please check your .env file and ensure GEMINI_API_KEY is set."
            )
        raise HTTPException(status_code=400, detail=error_msg)
    except GeminiUnavailable as e:
        raise HTTPException(status_code=503, detail=f"Gemini unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI answer: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

