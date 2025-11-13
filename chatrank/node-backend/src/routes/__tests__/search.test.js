const request = require('supertest');
const axios = require('axios');
const app = require('../../index');

jest.mock('axios');

describe('POST /api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should proxy search request to Python service', async () => {
    const mockResponse = {
      query: 'test query',
      ai_answer: 'Test answer',
      results: [],
      no_results: false
    };

    axios.post.mockResolvedValue({ data: mockResponse });

    const response = await request(app)
      .post('/api/search')
      .send({ query: 'test query', num_results: 5 })
      .expect(200);

    expect(response.body).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/search'),
      expect.objectContaining({ query: 'test query' }),
      expect.any(Object)
    );
  });

  it('should return 400 for empty query', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: '' })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('should handle Python service errors', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 500,
        data: { detail: 'Internal server error' }
      }
    });

    const response = await request(app)
      .post('/api/search')
      .send({ query: 'test' })
      .expect(500);

    expect(response.body.error).toBeDefined();
  });

  it('should handle connection refused errors', async () => {
    axios.post.mockRejectedValue({ code: 'ECONNREFUSED' });

    const response = await request(app)
      .post('/api/search')
      .send({ query: 'test' })
      .expect(503);

    expect(response.body.error).toContain('not available');
  });
});

