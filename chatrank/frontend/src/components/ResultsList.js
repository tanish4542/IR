import React from 'react';
import './ResultsList.css';
import ResultItem from './ResultItem';

function ResultsList({ results, query, rankingMode }) {
  if (!results || results.length === 0) {
    return null;
  }

  // Determine which score to display based on ranking mode
  const getDisplayScore = (result) => {
    switch (rankingMode) {
      case 'cosine':
        return result.cosine_score !== undefined && result.cosine_score !== null ? result.cosine_score : 0;
      case 'tfidf':
        return result.tfidf_term_score !== undefined && result.tfidf_term_score !== null ? result.tfidf_term_score : 0;
      case 'combined':
      default:
        return result.combined_score !== undefined && result.combined_score !== null ? result.combined_score : 0;
    }
  };

  // Sort by the selected ranking mode
  const sortedResults = [...results].sort((a, b) => {
    const scoreA = getDisplayScore(a);
    const scoreB = getDisplayScore(b);
    return scoreB - scoreA;
  });

  return (
    <div className="results-list">
      <h2 className="results-header">Search Results</h2>
      <div className="results-table">
        {sortedResults.map((result, index) => (
          <ResultItem
            key={index}
            result={result}
            rank={index + 1}
            query={query}
            rankingMode={rankingMode}
          />
        ))}
      </div>
    </div>
  );
}

export default ResultsList;

