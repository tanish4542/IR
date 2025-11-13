import React from 'react';
import './AIAnswer.css';

function AIAnswer({ answer }) {
  if (!answer) return null;

  return (
    <div className="ai-answer-card">
      <div className="ai-answer-header">
        <span className="ai-icon">🤖</span>
        <h3>AI Answer</h3>
      </div>
      <p className="ai-answer-text">{answer}</p>
    </div>
  );
}

export default AIAnswer;

