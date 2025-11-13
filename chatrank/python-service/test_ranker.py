"""
Unit tests for ranking logic.
"""
import pytest
from ranker import compute_ranking_metrics, normalize_scores, rank_documents

def test_normalize_scores():
    """Test min-max normalization."""
    scores = [0.1, 0.5, 0.3, 0.9, 0.2]
    normalized = normalize_scores(scores)
    
    assert len(normalized) == len(scores)
    assert min(normalized) >= 0.0
    assert max(normalized) <= 1.0
    assert normalized[3] == 1.0  # Max value should be 1.0
    assert normalized[0] == 0.0  # Min value should be 0.0

def test_normalize_scores_same_values():
    """Test normalization when all scores are the same."""
    scores = [0.5, 0.5, 0.5]
    normalized = normalize_scores(scores)
    
    assert len(normalized) == len(scores)
    # All should be 0.5 (or 0.0 if original was 0)
    assert all(s == 0.5 for s in normalized)

def test_compute_ranking_metrics():
    """Test ranking metrics computation with sample documents."""
    query = "machine learning"
    documents = [
        "Machine learning is a subset of artificial intelligence",
        "Python is a programming language",
        "Deep learning uses neural networks for machine learning tasks"
    ]
    
    cosine_scores, tfidf_scores, combined_scores = compute_ranking_metrics(
        query, documents, alpha=0.6
    )
    
    assert len(cosine_scores) == len(documents)
    assert len(tfidf_scores) == len(documents)
    assert len(combined_scores) == len(documents)
    
    # All scores should be normalized to 0..1
    assert all(0.0 <= s <= 1.0 for s in cosine_scores)
    assert all(0.0 <= s <= 1.0 for s in tfidf_scores)
    assert all(0.0 <= s <= 1.0 for s in combined_scores)
    
    # First and third documents should have higher scores than second
    assert cosine_scores[0] > cosine_scores[1] or cosine_scores[2] > cosine_scores[1]

def test_compute_ranking_metrics_empty_documents():
    """Test with empty documents."""
    query = "test query"
    documents = ["", "", ""]
    
    cosine_scores, tfidf_scores, combined_scores = compute_ranking_metrics(
        query, documents, alpha=0.6
    )
    
    assert len(cosine_scores) == len(documents)
    assert all(s == 0.0 for s in cosine_scores)

def test_rank_documents():
    """Test document ranking."""
    query = "artificial intelligence"
    results = [
        {
            'title': 'AI Basics',
            'url': 'http://example.com/ai',
            'text': 'Artificial intelligence is transforming technology',
            'snippet': 'AI basics...'
        },
        {
            'title': 'Cooking Recipes',
            'url': 'http://example.com/cooking',
            'text': 'Here are some great recipes for dinner',
            'snippet': 'Recipes...'
        },
        {
            'title': 'AI Research',
            'url': 'http://example.com/research',
            'text': 'Recent advances in artificial intelligence research',
            'snippet': 'Research...'
        }
    ]
    
    ranked = rank_documents(query, results, alpha=0.6)
    
    assert len(ranked) == len(results)
    assert 'cosine_score' in ranked[0]
    assert 'tfidf_term_score' in ranked[0]
    assert 'combined_score' in ranked[0]
    
    # Results should be sorted by combined_score (descending)
    for i in range(len(ranked) - 1):
        assert ranked[i]['combined_score'] >= ranked[i + 1]['combined_score']

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

