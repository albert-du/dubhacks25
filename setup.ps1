# Setup script for The Grounds project (PowerShell)
Write-Host "🎨 Setting up The Grounds - Therapeutic Tracing Web App" -ForegroundColor Cyan
Write-Host

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created!" -ForegroundColor Green
    Write-Host
    Write-Host "⚠️  IMPORTANT: Please edit the .env file and add your Gemini API key:" -ForegroundColor Red
    Write-Host "   GEMINI_API_KEY=your_actual_api_key_here" -ForegroundColor White
    Write-Host
    Write-Host "   Get your API key from: https://aistudio.google.com/app/apikey" -ForegroundColor Blue
    Write-Host
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "🐳 Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

Write-Host

# Ask if user wants to build and start
$response = Read-Host "🚀 Build and start the application now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "🏗️  Building and starting containers..." -ForegroundColor Yellow
    docker compose up --build
} else {
    Write-Host "📋 To start the application later, run:" -ForegroundColor Cyan
    Write-Host "   docker compose up --build" -ForegroundColor White
    Write-Host
    Write-Host "📍 Access the app at:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Blue
    Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Blue
}