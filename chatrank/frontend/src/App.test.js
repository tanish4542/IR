import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './services/api';

jest.mock('./services/api');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search bar', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/enter your search query/i)).toBeInTheDocument();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
  });

  it('submits search query', async () => {
    const mockResults = {
      query: 'test query',
      ai_answer: 'Test AI answer',
      results: [
        {
          title: 'Test Result',
          url: 'http://example.com',
          domain: 'example.com',
          snippet: 'Test snippet',
          cosine_score: 0.8,
          tfidf_term_score: 0.7,
          combined_score: 0.75
        }
      ],
      no_results: false
    };

    api.search.mockResolvedValue(mockResults);

    render(<App />);
    
    const input = screen.getByPlaceholderText(/enter your search query/i);
    const button = screen.getByText(/search/i);

    await userEvent.type(input, 'test query');
    await userEvent.click(button);

    await waitFor(() => {
      expect(api.search).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/test ai answer/i)).toBeInTheDocument();
    });
  });

  it('displays error message on search failure', async () => {
    api.search.mockRejectedValue(new Error('Search failed'));

    render(<App />);
    
    const input = screen.getByPlaceholderText(/enter your search query/i);
    const button = screen.getByText(/search/i);

    await userEvent.type(input, 'test');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

