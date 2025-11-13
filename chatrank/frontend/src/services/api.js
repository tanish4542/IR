import axios from 'axios';

export const search = async (baseURL, { query, num_results, ranking, alpha }) => {
  const response = await axios.post(`${baseURL}/api/search`, {
    query,
    num_results,
    ranking,
    alpha
  });
  return response.data;
};

export const chatbot = async (baseURL, { query }) => {
  const response = await axios.post(`${baseURL}/api/chatbot`, {
    query
  });
  return response.data;
};

