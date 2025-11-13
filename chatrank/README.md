# ChatRank — Chatbot-Based Mini Search Engine

A production-ready student project that combines web search, information retrieval (IR) ranking, and AI-powered explanations. ChatRank accepts user queries, fetches live web search results, computes relevance metrics (Cosine Similarity and TF-IDF Term Score), and provides AI-generated explanations using Google's Gemini.

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   React     │ ──────> │  Node.js     │ ──────> │   Python     │
│  Frontend   │         │   Gateway    │         │  Microservice│
│             │ <────── │  (Express)   │ <────── │   (FastAPI)  │
└─────────────┘         └──────────────┘         └──────────────┘
                                                         │
                                                         ├─> SerpApi (Web Search)
                                                         ├─> newspaper3k/BS4 (Content Extraction)
                                                         ├─> scikit-learn (TF-IDF Ranking)
                                                         └─> Gemini API (AI Answers)
```

### Components

1. **Frontend (React)**: User interface with search bar, results display, ranking metrics visualization
2. **Backend Gateway (Node.js + Express)**: Routes requests, proxies to Python service, optional MongoDB for history
3. **IR Microservice (Python + FastAPI)**: Core IR logic, SerpApi integration, TF-IDF vectorization, Gemini LLM calls

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+)
- **Python** (3.10+)
- **npm** or **yarn**
- **pip**

### API Keys Required

1. **SerpApi Key**: Sign up at [serpapi.com](https://serpapi.com) (free tier: ~250 searches/month)
2. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey) or Google Cloud Console

### Setup Steps

#### 1. Python Microservice

```bash
cd python-service
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env and add your keys:
# SERPAPI_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
# CACHE_TTL_SECONDS=86400
# PORT=8001

# Run the service
uvicorn app:app --reload --port 8001
```

The Python service will be available at `http://localhost:8001`

#### 2. Node.js Backend Gateway

```bash
cd node-backend
npm install

# Create .env file
cp .env.example .env
# Edit .env:
# NODE_ENV=development
# PORT=3000
# PY_SERVICE_URL=http://localhost:8001
# MONGO_URI=mongodb://localhost:27017/chatrank  # Optional

# Run the gateway
npm run dev
```

The gateway will be available at `http://localhost:3000`

#### 3. React Frontend

```bash
cd frontend
npm install

# Optional: Create .env file to override API URL
# REACT_APP_API_URL=http://localhost:3000

# Run the frontend
npm start
```

The frontend will open at `http://localhost:3000` (or another port if 3000 is taken)

## 📋 Features

### Search & Ranking

- **Live Web Search**: Fetches top results from SerpApi
- **Content Extraction**: Uses newspaper3k and BeautifulSoup to extract article text
- **Dual Ranking Metrics**:
  - **Cosine Similarity**: Measures vector similarity between query and document
  - **TF-IDF Term Score**: Sums TF-IDF weights of query terms in document
  - **Combined Score**: Weighted average (default: 60% cosine + 40% TF-IDF)
- **Ranking Modes**: Toggle between Combined, Cosine-only, or TF-IDF-only ranking
- **Caching**: 24-hour cache for SerpApi responses, page texts, and Gemini answers

### AI Integration

- **Gemini-Powered Answers**: 2-3 sentence explanations for every query
- **Cached Responses**: Identical queries return cached AI answers

### User Interface

- **Search Bar**: Enter queries with configurable number of results
- **AI Answer Card**: Displays Gemini-generated explanation at top
- **Results Table**: Shows ranked results with:
  - Title (clickable link)
  - Domain
  - Snippet (with query term highlighting)
  - All three scores (Cosine, TF-IDF, Combined)
  - Visual progress bar for selected ranking mode
- **Info Modal**: Explains what each metric means
- **Spelling Suggestions**: "Did you mean?" feature using rapidfuzz

## 🧪 Testing

### Python Tests

```bash
cd python-service
pytest test_ranker.py -v
```

### Node.js Tests

```bash
cd node-backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📡 API Endpoints

### Python Microservice (`http://localhost:8001`)

#### `POST /search`
Search endpoint that fetches, extracts, and ranks results.

**Request:**
```json
{
  "query": "machine learning applications",
  "num_results": 5,
  "ranking": "combined",
  "alpha": 0.6
}
```

**Response:**
```json
{
  "query": "machine learning applications",
  "ai_answer": "Machine learning applications... Verify with results below.",
  "results": [
    {
      "title": "10 Machine Learning Applications",
      "url": "https://example.com/ml-apps",
      "domain": "example.com",
      "snippet": "Machine learning is used in...",
      "cosine_score": 0.8234,
      "tfidf_term_score": 0.6712,
      "combined_score": 0.7589,
      "preview_unavailable": false,
      "raw_meta": {}
    }
  ],
  "no_results": false
}
```

#### `POST /chatbot`
Get AI answer for a query.

**Request:**
```json
{
  "query": "what is reinforcement learning"
}
```

**Response:**
```json
{
  "query": "what is reinforcement learning",
  "answer": "Reinforcement learning is... Verify with results below."
}
```

#### `GET /health`
Health check endpoint.

### Node.js Gateway (`http://localhost:3000`)

#### `POST /api/search`
Proxies to Python service `/search` endpoint.

#### `POST /api/chatbot`
Proxies to Python service `/chatbot` endpoint.

## 🔧 Configuration

### Environment Variables

#### Python Service (`.env`)
- `SERPAPI_KEY`: Your SerpApi API key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CACHE_TTL_SECONDS`: Cache TTL in seconds (default: 86400 = 24 hours)
- `PORT`: Port for FastAPI service (default: 8001)

#### Node Backend (`.env`)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Port for Express server (default: 3000)
- `PY_SERVICE_URL`: URL of Python microservice (default: http://localhost:8001)
- `MONGO_URI`: MongoDB connection string (optional, for query history)

#### Frontend (`.env`)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3000)

## 📊 Ranking Metrics Explained

### Cosine Similarity (0.0 - 1.0)
Measures the angle between query and document vectors in TF-IDF space. A score of 1.0 means perfect directional match, 0.0 means orthogonal (no similarity). Captures overall semantic similarity.

### TF-IDF Term Score (0.0 - 1.0)
Sums the TF-IDF weights of all query terms found in the document, normalized by query length. Higher scores indicate more important instances of query terms. Emphasizes term presence and importance.

### Combined Score (0.0 - 1.0)
Weighted average: `α × Cosine + (1-α) × TF-IDF` (default α=0.6). Balances semantic similarity and term importance for comprehensive ranking.

## 🎯 Demo Queries

Try these sample queries to test the system:

- `machine learning applications`
- `what is reinforcement learning`
- `advantage of nodejs over python`
- `machne leraning applictions` (intentionally misspelled to test spelling suggestions)

## ⚠️ Limitations & Notes

### Free Tier Limits
- **SerpApi**: ~250 searches/month on free tier. Caching helps conserve quota.
- **Gemini API**: Check Google's rate limits for your tier.

### Content Extraction
- Some JavaScript-heavy sites may not be parseable by newspaper3k/BeautifulSoup
- Pages that fail extraction will show "Preview unavailable" flag
- The app gracefully handles extraction failures

### Performance
- First search for a query may take 10-30 seconds (fetching + extraction)
- Cached queries return instantly
- Consider adding embedding-based re-ranking for better semantic quality in future

## 🐛 Error Handling

- **SerpApi Rate Limit**: Returns HTTP 429 with clear message
- **Page Fetch Failures**: Results include `preview_unavailable: true` flag
- **No Results**: Returns AI answer only with `no_results: true`
- **Python Service Unavailable**: Node gateway returns 503 with helpful message

## 📁 Project Structure

```
chatrank/
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/       # API service
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── node-backend/           # Express gateway
│   ├── src/
│   │   ├── routes/         # API routes
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── python-service/         # FastAPI microservice
│   ├── app.py             # FastAPI app
│   ├── searcher.py        # SerpApi integration
│   ├── fetcher.py         # Page extraction
│   ├── ranker.py          # TF-IDF ranking
│   ├── llm.py             # Gemini wrapper
│   ├── cache.py           # Caching utilities
│   ├── test_ranker.py     # Unit tests
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Deployment

### Local Development
Run all three services simultaneously in separate terminals:

1. Terminal 1: `cd python-service && uvicorn app:app --reload --port 8001`
2. Terminal 2: `cd node-backend && npm run dev`
3. Terminal 3: `cd frontend && npm start`

### Production
- Use process managers (PM2 for Node, systemd for Python)
- Set up reverse proxy (nginx) for frontend
- Configure environment variables securely
- Use production-grade caching (Redis) instead of in-memory cache

## 📝 Sample cURL Commands

### Search Endpoint
```bash
curl -X POST http://localhost:8001/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning applications",
    "num_results": 5,
    "ranking": "combined"
  }'
```

### Chatbot Endpoint
```bash
curl -X POST http://localhost:8001/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "query": "what is reinforcement learning"
  }'
```

## 👨‍💻 Development

### Adding Features
- **New Ranking Metrics**: Extend `ranker.py` and update frontend to display
- **Additional LLM Providers**: Modify `llm.py` to support other APIs
- **Query History**: Implement MongoDB persistence in Node backend
- **Analytics Dashboard**: Add route to show cache hit rates and top queries

## 📄 License

This is a student project for educational purposes.

## 🙏 Acknowledgments

- SerpApi for web search API
- Google Gemini for AI answers
- scikit-learn for TF-IDF vectorization
- FastAPI, Express, and React communities

---

**Built with ❤️ for Information Retrieval course**

