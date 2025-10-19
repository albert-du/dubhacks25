# The Grounds - Therapeutic Tracing Web App

A therapeutic coloring and tracing application that uses AI to generate personalized coloring book pages and track user progress.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Gemini API key from Google AI Studio

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dubhacks25
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Build and start the application**
   ```bash
   docker-compose up --build
   ```

   For background mode:
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Stopping the Application

```bash
docker-compose down
```

To also remove volumes:
```bash
docker-compose down -v
```

## 🏗️ Architecture

- **Backend**: Flask REST API with Gemini AI integration
  - Port: 5000
  - Generates coloring book pages using Gemini 2.0 Flash
  - Integrates Prompt Enhancer API for better therapeutic content
  - Provides scoring endpoints for user progress tracking

- **Frontend**: Next.js application
  - Port: 3000
  - React-based UI for coloring and tracing activities
  - Tailwind CSS for styling

## 📁 Project Structure

```
dubhacks25/
├── backend/              # Flask API
│   ├── app.py           # Application factory
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic (AI generation)
│   ├── models/          # Data models
│   ├── Dockerfile       # Backend container config
│   └── requirements.txt # Python dependencies
├── the-grounds/         # Next.js frontend
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── Dockerfile      # Frontend container config
│   └── package.json    # Node dependencies
└── docker-compose.yml  # Orchestration config
```

## 🔧 Development

### Running Locally (without Docker)

#### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd the-grounds
npm install
npm run dev
```

## 🌐 API Endpoints

### POST /api/generate
Generate a coloring book page from a text prompt.

**Request:**
```json
{
  "prompt": "a happy dog playing in a park"
}
```

**Response:**
```json
{
  "id": "img_abc123",
  "url": "/static/img_abc123.png"
}
```

### POST /api/score
Score a user's traced image against the original.

**Request:**
```json
{
  "original_id": "img_abc123",
  "traced_data": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "score": 0.85,
  "feedback": "Great job! Very accurate tracing."
}
```

## 🔑 Environment Variables

### Backend
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `FLASK_ENV`: Environment mode (production/development)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (defaults to http://backend:5000 in Docker)

## 📝 License

MIT
