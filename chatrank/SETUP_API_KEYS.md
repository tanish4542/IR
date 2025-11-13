# Setup API Keys for ChatRank

## Issue
The application is showing a 500 error because API keys are not configured. The `.env` file exists but is empty.

## Solution

### Step 1: Edit the Python Service .env File

Open the file: `python-service/.env`

Add the following content:

```bash
# SerpApi API Key (required for web search)
# Get your key from: https://serpapi.com
SERPAPI_KEY=your_serpapi_key_here

# Gemini API Key (required for AI answers)
# Get your key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Cache TTL in seconds (optional, default: 86400 = 24 hours)
CACHE_TTL_SECONDS=86400

# Port for FastAPI service (optional, default: 8001)
PORT=8001
```

### Step 2: Get API Keys

#### SerpApi Key
1. Go to https://serpapi.com
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Replace `your_serpapi_key_here` in the .env file

#### Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key
5. Replace `your_gemini_api_key_here` in the .env file

### Step 3: Restart the Python Service

After adding the API keys, restart the Python service:

1. Find the Python service process:
   ```bash
   ps aux | grep uvicorn
   ```

2. Kill the process:
   ```bash
   kill <process_id>
   ```

3. Restart the service:
   ```bash
   cd python-service
   python3 -m uvicorn app:app --reload --port 8001
   ```

Or if using the run-all.sh script, stop all services (Ctrl+C) and restart.

### Step 4: Test the Application

1. Open http://localhost:3001 in your browser
2. Try searching for "machine learning applications"
3. The application should now work properly

## Troubleshooting

### Error: "SERPAPI_KEY environment variable not set"
- Make sure the .env file is in the `python-service/` directory
- Check that the file is named exactly `.env` (not `.env.txt` or similar)
- Verify the format: `SERPAPI_KEY=your_key_here` (no spaces around the `=`)
- Restart the Python service after making changes

### Error: "GEMINI_API_KEY environment variable not set"
- Same as above, but for the Gemini API key
- Make sure both keys are in the same .env file

### Error: "Service configuration error"
- Check that your API keys are valid
- Verify that you haven't exceeded your API quota (SerpApi free tier: ~250 searches/month)
- Check the Python service logs for more details

## Note

The .env file is gitignored for security reasons, so you need to create it manually. The file should be in:
- `python-service/.env` for Python service configuration

---

**After setting up API keys, the application will work correctly!**

