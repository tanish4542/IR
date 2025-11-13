import React from 'react';
import './SearchBar.css';

function SearchBar({ 
  query, 
  setQuery, 
  onSubmit, 
  numResults, 
  setNumResults, 
  rankingMode, 
  setRankingMode,
  loading 
}) {
  return (
    <div className="search-container">
      <form onSubmit={onSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="search-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="search-options">
          <div className="option-group">
            <label htmlFor="num-results">Number of Results:</label>
            <select
              id="num-results"
              value={numResults}
              onChange={(e) => setNumResults(parseInt(e.target.value))}
              disabled={loading}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
          
          <div className="option-group">
            <label htmlFor="ranking-mode">Ranking Mode:</label>
            <select
              id="ranking-mode"
              value={rankingMode}
              onChange={(e) => setRankingMode(e.target.value)}
              disabled={loading}
            >
              <option value="combined">Combined</option>
              <option value="cosine">Cosine Similarity Only</option>
              <option value="tfidf">TF-IDF Term Score Only</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;

