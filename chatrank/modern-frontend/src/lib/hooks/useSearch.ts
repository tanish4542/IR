import { useState } from 'react';
import { postSearch } from '@/lib/api';

export function useSearch() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isFetching, setFetching] = useState(false);
  const useMocks = Boolean(import.meta.env.VITE_USE_MOCKS);

  const search = async (query: string, num_results = 5, ranking: 'combined' | 'cosine' | 'tfidf' = 'combined') => {
    setFetching(true);
    setError(null);
    try {
      if (useMocks) {
        await new Promise((r) => setTimeout(r, 700));
        setData({
          ai_answer: 'Mock AI answer summarizing your query.',
          did_you_mean: query.length > 4 ? query.slice(0, -1) : undefined,
          results: Array.from({ length: 5 }).map((_, i) => ({
            title: `Result ${i + 1} for ${query}`,
            url: `https://example.com/${i + 1}`,
            domain: 'example.com',
            snippet: `This is a mock snippet for ${query} with tf idf and cosine explanation.`,
            cosine_score: Math.max(0, Math.min(1, 0.9 - i * 0.08)),
            tfidf_term_score: Math.max(0, Math.min(1, 0.8 - i * 0.07)),
            combined_score: Math.max(0, Math.min(1, 0.85 - i * 0.075))
          }))
        });
      } else {
        const res = await postSearch(query, num_results, ranking);
        setData(res.data);
      }
    } catch (e) {
      if (useMocks) {
        // Fallback mock on error
        setData({
          ai_answer: 'Mock (fallback): service unavailable, showing sample results.',
          did_you_mean: undefined,
          results: Array.from({ length: 3 }).map((_, i) => ({
            title: `Sample Result ${i + 1} for ${query}`,
            url: `https://example.com/${i + 1}`,
            domain: 'example.com',
            snippet: `Sample snippet mentioning ${query} with tf idf and cosine.`,
            cosine_score: 0.8 - i * 0.05,
            tfidf_term_score: 0.75 - i * 0.05,
            combined_score: 0.78 - i * 0.05
          }))
        });
      } else {
        setError(e);
      }
    } finally {
      setFetching(false);
    }
  };

  return { data, error, isFetching, search };
}


