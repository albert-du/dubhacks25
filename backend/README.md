# TraceMe Backend (Flask)

Minimal Flask backend for TraceMe with two endpoints:
- POST /api/generate — generates outline images using Gemini AI (when API key has quota)
- POST /api/score — returns mock accuracy/smoothness and feedback

## Quickstart

1) Create/activate a Python 3.11+ environment
2) Copy `.env.example` to `.env` and add your Gemini API key

```pwsh
copy .env.example .env
```

Then edit `.env` and add:
```
GEMINI_API_KEY=your_actual_api_key_here
```

3) Install deps

```pwsh
pip install -r requirements.txt
```

4) Run the app

```pwsh
python app.py
```

The server runs on http://127.0.0.1:5000 by default.

## Notes
- CORS allowed for http://localhost:3000
- Files organized with Blueprints, services, models (Pydantic), and utils
- **Current Status**: Image generation models (`gemini-2.0-flash-preview-image-generation`, `gemini-2.0-flash-exp-image-generation`) are available but may have free tier quota limitations
- If API quota is exceeded or model is unavailable, automatically falls back to a simple mock outline image
- Generated images would be saved to `backend/static/` when quota allows
- The infrastructure is fully ready for AI image generation - just needs API quota