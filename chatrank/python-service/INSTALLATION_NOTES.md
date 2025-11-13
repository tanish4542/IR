# Installation Notes

## Python Version Compatibility

**Important**: This project requires Python 3.10, 3.11, or 3.12. Python 3.13 is not yet fully supported by scikit-learn.

### If you're using Python 3.13:

You have two options:

#### Option 1: Use Python 3.12 (Recommended)

```bash
# Install Python 3.12 using pyenv (if you have it)
pyenv install 3.12.0
pyenv local 3.12.0

# Or use Homebrew
brew install python@3.12

# Then create a virtual environment with Python 3.12
python3.12 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows

pip install -r requirements.txt
```

#### Option 2: Try installing with updated scikit-learn

The requirements.txt has been updated to use `scikit-learn>=1.4.0` which may have better Python 3.13 support. Try:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If you still encounter errors, please use Python 3.12 or earlier.

### Recommended Setup

1. **Create a virtual environment** (always recommended):
   ```bash
   python3.12 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

### Troubleshooting

- **scikit-learn installation fails**: Use Python 3.10-3.12
- **OpenMP errors on macOS**: Install libomp: `brew install libomp`
- **Cython errors**: Upgrade pip, setuptools, and wheel: `pip install --upgrade pip setuptools wheel`

