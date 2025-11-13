const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const searchRoutes = require('./routes/search');
const chatbotRoutes = require('./routes/chatbot');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PY_SERVICE_URL = process.env.PY_SERVICE_URL || 'http://localhost:8001';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'chatrank-gateway' });
});

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`ChatRank Gateway running on port ${PORT}`);
  console.log(`Python service URL: ${PY_SERVICE_URL}`);
});

module.exports = app;

