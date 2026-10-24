"""
CareCompass Backend Server Runner
Usage:
  python run.py
Starts Uvicorn server on http://127.0.0.1:8000
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"Starting CareCompass Backend on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
