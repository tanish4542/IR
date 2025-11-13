const express = require('express');
const axios = require('axios');
const router = express.Router();

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || 'http://localhost:8001';

router.post('/', async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required and must be a non-empty string' });
    }
    
    // Proxy to Python service
    const response = await axios.post(`${PY_SERVICE_URL}/chatbot`, {
      query: query.trim()
    }, {
      timeout: 15000 // 15 second timeout
    });
    
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Python service returned an error
      res.status(error.response.status).json({
        error: error.response.data.detail || error.response.data.error || 'Chatbot service error'
      });
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Python service is not available. Please ensure it is running.' });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(504).json({ error: 'Request to Python service timed out' });
    } else {
      next(error);
    }
  }
});

module.exports = router;

