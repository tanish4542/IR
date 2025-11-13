"""
Caching utilities for SerpApi responses, extracted page texts, and Gemini answers.
"""
import json
import hashlib
import time
from typing import Optional, Dict, Any
import os

class Cache:
    """Simple in-memory cache with TTL support."""
    
    def __init__(self, ttl_seconds: int = 86400):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds
    
    def _get_key(self, prefix: str, value: str) -> str:
        """Generate a cache key from prefix and value."""
        normalized = value.lower().strip()
        key_str = f"{prefix}:{normalized}"
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, prefix: str, value: str) -> Optional[Any]:
        """Get cached value if it exists and hasn't expired."""
        key = self._get_key(prefix, value)
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] < self.ttl_seconds:
                print(f"[CACHE HIT] {prefix}: {value[:50]}...")
                return entry['data']
            else:
                # Expired, remove it
                del self.cache[key]
                print(f"[CACHE EXPIRED] {prefix}: {value[:50]}...")
        print(f"[CACHE MISS] {prefix}: {value[:50]}...")
        return None
    
    def set(self, prefix: str, value: str, data: Any) -> None:
        """Store value in cache with current timestamp."""
        key = self._get_key(prefix, value)
        self.cache[key] = {
            'data': data,
            'timestamp': time.time()
        }
        print(f"[CACHE SET] {prefix}: {value[:50]}...")

# Global cache instance
cache = Cache(ttl_seconds=int(os.getenv('CACHE_TTL_SECONDS', 86400)))

