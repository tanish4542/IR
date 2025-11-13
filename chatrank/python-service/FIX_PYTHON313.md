# Fix for Python 3.13 Compatibility Issue

## Problem
scikit-learn 1.3.2 doesn't support Python 3.13. You're currently using Python 3.13.3.

## Solution Options

### Option 1: Install Python 3.12 (Recommended)

**Using Homebrew:**
```bash
brew install python@3.12
```

**Then create a virtual environment with Python 3.12:**
```bash
cd python-service
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Using pyenv (if you have it):**
```bash
pyenv install 3.12.0
pyenv local 3.12.0
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Option 2: Try with Updated Dependencies

I've updated `requirements.txt` to use `scikit-learn>=1.4.0`. Try:

```bash
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

If this still fails, use Option 1.

### Option 3: Use Pre-built Wheels (Quick Fix)

Try installing scikit-learn from a pre-built wheel:

```bash
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install numpy
pip install scikit-learn --only-binary :all:
pip install -r requirements.txt
```

## After Installation

Once dependencies are installed:

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your SERPAPI_KEY and GEMINI_API_KEY
   ```

2. **Run the service:**
   ```bash
   uvicorn app:app --reload --port 8001
   ```

## Why This Happens

Python 3.13 was released recently (October 2024), and many scientific Python packages like scikit-learn need time to add full support. The Cython compilation errors you're seeing are due to compatibility issues between scikit-learn's Cython code and Python 3.13's updated C API.

