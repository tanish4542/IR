import React from 'react';
import './ResultItem.css';

function ResultItem({ result, rank, query, rankingMode }) {
  const highlightQueryTerms = (text) => {
    if (!text || !query) return text;
    
    const terms = query.toLowerCase().split(/\s+/);
    let highlighted = text;
    
    terms.forEach(term => {
      if (term.length > 2) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    });
    
    return { __html: highlighted };
  };

  const getDisplayScore = () => {
    switch (rankingMode) {
      case 'cosine':
        return result.cosine_score !== undefined ? result.cosine_score : 0;
      case 'tfidf':
        return result.tfidf_term_score !== undefined ? result.tfidf_term_score : 0;
      case 'combined':
      default:
        return result.combined_score !== undefined ? result.combined_score : 0;
    }
  };

  const displayScore = getDisplayScore();

  return (
    <div className="result-item">
      <div className="result-header">
        <span className="rank-badge">#{rank}</span>
        <div className="result-title-group">
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="result-title"
          >
            {result.title}
          </a>
          <span className="result-domain">{result.domain}</span>
        </div>
      </div>
      
      {result.snippet && (
        <p 
          className="result-snippet"
          dangerouslySetInnerHTML={highlightQueryTerms(result.snippet)}
        />
      )}
      
      {result.preview_unavailable && (
        <div className="preview-unavailable">
          ⚠️ Preview unavailable for this page
        </div>
      )}
      
      <div className="result-metrics">
        <div className="metric">
          <span className="metric-label">Cosine Similarity:</span>
          <span className="metric-value">
            {result.cosine_score !== undefined && result.cosine_score !== null 
              ? result.cosine_score.toFixed(4) 
              : 'N/A'}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">TF-IDF Term Score:</span>
          <span className="metric-value">
            {result.tfidf_term_score !== undefined && result.tfidf_term_score !== null 
              ? result.tfidf_term_score.toFixed(4) 
              : 'N/A'}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Combined Score:</span>
          <span className="metric-value">
            {result.combined_score !== undefined && result.combined_score !== null 
              ? result.combined_score.toFixed(4) 
              : 'N/A'}
          </span>
        </div>
      </div>
      
      <div className="score-bar-container">
        <div className="score-bar-label">
          {rankingMode === 'combined' ? 'Combined' : 
           rankingMode === 'cosine' ? 'Cosine' : 'TF-IDF'} Score: {
            displayScore !== undefined && displayScore !== null 
              ? displayScore.toFixed(4) 
              : 'N/A'
          }
        </div>
        <div className="score-bar">
          <div 
            className="score-bar-fill"
            style={{ 
              width: `${displayScore !== undefined && displayScore !== null 
                ? displayScore * 100 
                : 0}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ResultItem;

