#!/bin/bash

# Setup script for The Grounds project
echo "🎨 Setting up The Grounds - Therapeutic Tracing Web App"
echo

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo
    echo "⚠️  IMPORTANT: Please edit the .env file and add your Gemini API key:"
    echo "   GEMINI_API_KEY=your_actual_api_key_here"
    echo
    echo "   Get your API key from: https://aistudio.google.com/app/apikey"
    echo
else
    echo "✅ .env file already exists"
    echo
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "🐳 Docker is running"
echo

# Ask if user wants to build and start
read -p "🚀 Build and start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Building and starting containers..."
    docker compose up --build
else
    echo "📋 To start the application later, run:"
    echo "   docker compose up --build"
    echo
    echo "📍 Access the app at:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
fi