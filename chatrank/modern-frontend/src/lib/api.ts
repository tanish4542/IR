import axios from 'axios';

// Prefer same-origin + Vite dev proxy. If VITE_API_URL is set, use it.
const configured = (import.meta as any).env?.VITE_API_URL as string | undefined;
const baseURL = configured && configured.length > 0 ? configured : '';
export const api = axios.create({
  baseURL,
  timeout: 15000
});

export function postChat(query: string) {
  return api.post('/api/chatbot', { query });
}

export function postSearch(query: string, num_results = 5, ranking: 'combined' | 'cosine' | 'tfidf' = 'combined') {
  return api.post('/api/search', { query, num_results, ranking });
}


