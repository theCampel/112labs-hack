#!/bin/bash

# 🚀 Mario Boardroom + AI Services + Ngrok Startup Script

echo "🎮 Starting Mario Boardroom AI Services with Ngrok..."
echo "=================================================="

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo "❌ .env file not found! Please create it with your API keys."
    echo "📝 See environment-setup.md for required environment variables."
    echo ""
    echo "💡 Quick setup:"
    echo "   1. Copy template: cp environment-setup.md .env"
    echo "   2. Edit .env with your actual API keys"
    echo "   3. Add: NGROK_BASE_URL=https://advanced-possibly-lab.ngrok-free.app"
    exit 1
fi

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok not found! Please install it first:"
    echo "   brew install ngrok/ngrok/ngrok"
    echo "   OR download from: https://ngrok.com/download"
    echo ""
    echo "📝 See ngrok-setup.md for complete setup instructions."
    exit 1
fi

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
cd "flask-backend"
if ! python -c "import flask, requests, google.genai, atproto" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi
cd ..

# Check if Node.js dependencies are installed
echo "📦 Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting services..."
echo "📍 Next.js Mario App: http://localhost:3000"
echo "📍 Flask API Server: http://localhost:8000"
echo ""

# Start Flask API in background
cd "flask-backend/services"
source ../../venv/bin/activate
python app.py &
FLASK_PID=$!
cd ../..

# Wait for Flask to start
echo "⏳ Waiting for Flask API to start..."
sleep 3

# Check if Flask is running
if ! curl -s http://localhost:8000/description > /dev/null; then
    echo "❌ Flask API failed to start on port 8000"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

echo "✅ Flask API is running on http://localhost:8000"

# Start Next.js app in background
npm run dev &
NEXTJS_PID=$!

echo ""
echo "🌐 NGROK SETUP REQUIRED:"
echo "=================================================="
echo "🚨 Open a NEW TERMINAL and run:"
echo "   ngrok http 8000"
echo ""
echo "🧪 Test your setup:"
echo "   curl \$NGROK_BASE_URL/description"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FLASK_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Handle Ctrl+C
trap cleanup INT

# Wait for user to press Ctrl+C
wait 