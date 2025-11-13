import React from 'react';
import './InfoModal.css';

function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Understanding Ranking Metrics</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="metric-explanation">
            <h3>1. Cosine Similarity (0.0 - 1.0)</h3>
            <p>
              Cosine similarity measures the angle between the query vector and document vector 
              in a high-dimensional TF-IDF space. A score of 1.0 means the vectors are identical 
              in direction (perfect match), while 0.0 means they are orthogonal (no similarity).
              This metric captures how well the document's overall content matches the query.
            </p>
          </div>
          
          <div className="metric-explanation">
            <h3>2. TF-IDF Term Score (0.0 - 1.0)</h3>
            <p>
              TF-IDF (Term Frequency-Inverse Document Frequency) term score sums the TF-IDF weights 
              of all query terms found in the document, normalized by the number of query terms.
              Higher scores indicate that the document contains more important instances of the 
              query terms. This metric emphasizes the raw presence and importance of query terms.
            </p>
          </div>
          
          <div className="metric-explanation">
            <h3>3. Combined Score (0.0 - 1.0)</h3>
            <p>
              The combined score is a weighted average: <strong>α × Cosine + (1-α) × TF-IDF</strong>, 
              where α defaults to 0.6. This balances both semantic similarity (cosine) and term 
              importance (TF-IDF) to provide a more comprehensive ranking.
            </p>
          </div>
          
          <div className="metric-explanation">
            <h3>Ranking Modes</h3>
            <ul>
              <li><strong>Combined:</strong> Uses the weighted combination of both metrics</li>
              <li><strong>Cosine Only:</strong> Ranks solely by cosine similarity</li>
              <li><strong>TF-IDF Only:</strong> Ranks solely by TF-IDF term score</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;

