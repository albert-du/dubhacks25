"""
TraceMe Flask Backend

Run locally:
  pip install -r requirements.txt
  python app.py

This app exposes:
  POST /api/generate -> returns a mock outline image reference
  POST /api/score    -> returns mock scoring metrics for traced strokes

Structure uses Blueprints (routes/), services/, models/ (Pydantic), and utils/.
"""

from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

from utils.logger import configure_logging

# Load environment variables from .env file
load_dotenv()


def create_app() -> Flask:
    """Application factory to create and configure the Flask app."""
    # Ensure instance and static directories exist
    base_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(base_dir, "static")
    os.makedirs(static_dir, exist_ok=True)

    configure_logging()

    app = Flask(__name__, static_folder="static")

    # Enable CORS for local frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
        supports_credentials=False,
    )

    # Register blueprints
    from routes.generate import generate_bp
    from routes.score import score_bp

    app.register_blueprint(generate_bp, url_prefix="/api")
    app.register_blueprint(score_bp, url_prefix="/api")

    return app


if __name__ == "__main__":
    app = create_app()
    # Note: host default is 127.0.0.1, port default is 5000
    app.logger.info("TraceMe backend starting...")
    app.run(debug=True)
