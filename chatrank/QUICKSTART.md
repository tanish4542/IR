# ChatRank Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get API Keys

1. **SerpApi**: Sign up at https://serpapi.com (free tier: ~250 searches/month)
2. **Gemini**: Get API key from https://makersuite.google.com/app/apikey

### Step 2: Setup Python Service

```bash
cd python-service
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your SERPAPI_KEY and GEMINI_API_KEY
uvicorn app:app --reload --port 8001
```

### Step 3: Setup Node Backend

```bash
cd node-backend
npm install
cp .env.example .env
npm run dev
```

### Step 4: Setup React Frontend

```bash
cd frontend
npm install
# Run on port 3001 to avoid conflict with Node backend on port 3000
PORT=3001 npm start
```

### Step 5: Test It!

1. Open http://localhost:3001 in your browser (React runs on port 3001 to avoid conflict with Node backend on port 3000)
2. Try searching: "machine learning applications"
3. See the AI answer and ranked results with scores!

## 📝 Environment Variables

### python-service/.env
```
SERPAPI_KEY=your_key_here
GEMINI_API_KEY=your_key_here
CACHE_TTL_SECONDS=86400
PORT=8001
```

### node-backend/.env
```
NODE_ENV=development
PORT=3000
PY_SERVICE_URL=http://localhost:8001
```

## 🧪 Run Tests

```bash
# Python tests
cd python-service && pytest test_ranker.py -v

# Node tests
cd node-backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🐛 Troubleshooting

- **Python service won't start**: Check if port 8001 is available
- **Node backend can't connect**: Ensure Python service is running first
- **No results**: Check SerpApi key and quota
- **AI answer fails**: Check Gemini API key

## 📚 Full Documentation

See [README.md](./README.md) for complete documentation.

