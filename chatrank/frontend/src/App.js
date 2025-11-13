import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import AIAnswer from './components/AIAnswer';
import ResultsList from './components/ResultsList';
import InfoModal from './components/InfoModal';
import { search } from './services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [query, setQuery] = useState('');
  const [numResults, setNumResults] = useState(5);
  const [rankingMode, setRankingMode] = useState('combined');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await search(API_BASE_URL, {
        query: searchQuery,
        num_results: numResults,
        ranking: rankingMode,
        alpha: 0.6
      });
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>ChatRank</h1>
        <p className="app-subtitle">Chatbot-Based Mini Search Engine</p>
        <button 
          className="info-button" 
          onClick={() => setShowInfoModal(true)}
          title="Learn about ranking metrics"
        >
          ℹ️ About Scores
        </button>
      </header>

      <SearchBar
        query={query}
        setQuery={setQuery}
        onSubmit={handleSubmit}
        numResults={numResults}
        setNumResults={setNumResults}
        rankingMode={rankingMode}
        setRankingMode={setRankingMode}
        loading={loading}
      />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {results && (
        <>
          <AIAnswer answer={results.ai_answer} />
          {results.spelling_suggestion && (
            <div className="spelling-suggestion">
              Did you mean: <strong>{results.spelling_suggestion}</strong>?
            </div>
          )}
          {results.no_results ? (
            <div className="no-results">
              No web results found. Please try a different query.
            </div>
          ) : (
            <ResultsList 
              results={results.results} 
              query={results.query}
              rankingMode={rankingMode}
            />
          )}
        </>
      )}

      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </div>
  );
}

export default App;

