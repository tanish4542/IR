"""
TF-IDF ranking logic: cosine similarity and TF-IDF term score computation.
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple
import re

def tokenize_query(query: str) -> List[str]:
    """Simple tokenization for query."""
    # Lowercase and split on whitespace
    tokens = re.findall(r'\b\w+\b', query.lower())
    return tokens

def compute_ranking_metrics(
    query: str,
    documents: List[str],
    alpha: float = 0.6
) -> Tuple[List[float], List[float], List[float]]:
    """
    Compute cosine similarity and TF-IDF term scores for documents.
    
    Args:
        query: Search query string
        documents: List of document texts (preprocessed)
        alpha: Weight for combined score (alpha * cosine + (1-alpha) * tfidf)
    
    Returns:
        Tuple of (cosine_scores, tfidf_term_scores, combined_scores)
    """
    if not documents or all(not doc for doc in documents):
        return [0.0] * len(documents), [0.0] * len(documents), [0.0] * len(documents)
    
    # Filter out empty documents for vectorization
    valid_docs = []
    valid_indices = []
    for i, doc in enumerate(documents):
        if doc and len(doc.strip()) > 0:
            valid_docs.append(doc)
            valid_indices.append(i)
    
    if not valid_docs:
        return [0.0] * len(documents), [0.0] * len(documents), [0.0] * len(documents)
    
    # Build TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        max_features=5000
    )
    
    # Fit on documents and transform
    doc_vectors = vectorizer.fit_transform(valid_docs)
    
    # Transform query
    query_vector = vectorizer.transform([query.lower()])
    
    # Compute cosine similarity
    cosine_sims = cosine_similarity(query_vector, doc_vectors).flatten()
    
    # Compute TF-IDF term score for each document
    # For each query token, sum its TF-IDF value in the document
    query_tokens = tokenize_query(query)
    tfidf_term_scores = []
    
    feature_names = vectorizer.get_feature_names_out()
    query_vector_dense = query_vector.toarray()[0]
    doc_vectors_dense = doc_vectors.toarray()
    
    for doc_vec in doc_vectors_dense:
        score = 0.0
        matched_terms = 0
        
        for token in query_tokens:
            # Check if token exists in vocabulary (possibly as n-gram)
            for i, feature in enumerate(feature_names):
                if token in feature:  # Token is part of this feature (could be unigram or bigram)
                    score += doc_vec[i]
                    matched_terms += 1
        
        # Normalize by number of query terms (or matched terms if any)
        if matched_terms > 0:
            score = score / len(query_tokens)  # Normalize by query length
        else:
            score = 0.0
        
        tfidf_term_scores.append(score)
    
    # Create full lists with zeros for invalid documents
    full_cosine = [0.0] * len(documents)
    full_tfidf = [0.0] * len(documents)
    
    for idx, valid_idx in enumerate(valid_indices):
        full_cosine[valid_idx] = float(cosine_sims[idx])
        full_tfidf[valid_idx] = float(tfidf_term_scores[idx])
    
    # Normalize scores to 0..1 range (min-max normalization)
    cosine_scores = normalize_scores(full_cosine)
    tfidf_scores = normalize_scores(full_tfidf)
    
    # Compute combined scores
    combined_scores = [
        alpha * cos + (1 - alpha) * tfidf
        for cos, tfidf in zip(cosine_scores, tfidf_scores)
    ]
    
    return cosine_scores, tfidf_scores, combined_scores

def normalize_scores(scores: List[float]) -> List[float]:
    """
    Min-max normalization to 0..1 range.
    If all scores are the same, return as-is (or all 0.5).
    """
    if not scores:
        return []
    
    min_score = min(scores)
    max_score = max(scores)
    
    if max_score == min_score:
        # All scores are the same, return normalized to 0.5 or keep original
        return [0.5 if s > 0 else 0.0 for s in scores]
    
    normalized = [(s - min_score) / (max_score - min_score) for s in scores]
    return normalized

def rank_documents(
    query: str,
    results: List[Dict],
    alpha: float = 0.6
) -> List[Dict]:
    """
    Rank documents by computing metrics and sorting by combined score.
    
    Args:
        query: Search query
        results: List of result dicts with 'text' field
        alpha: Weight for combined score
    
    Returns:
        List of results with added 'cosine_score', 'tfidf_term_score', 'combined_score'
    """
    # Extract document texts
    documents = [r.get('text', '') or '' for r in results]
    
    # Compute metrics
    cosine_scores, tfidf_scores, combined_scores = compute_ranking_metrics(
        query, documents, alpha
    )
    
    # Add scores to results
    for i, result in enumerate(results):
        result['cosine_score'] = round(cosine_scores[i], 4)
        result['tfidf_term_score'] = round(tfidf_scores[i], 4)
        result['combined_score'] = round(combined_scores[i], 4)
    
    # Sort by combined score (descending)
    results.sort(key=lambda x: x['combined_score'], reverse=True)
    
    return results

