import os
import sys

# Add the current directory to sys.path to ensure 'backend' can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
