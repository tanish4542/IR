#!/bin/bash

# Script to run all ChatRank services
# Usage: ./run-all.sh

echo "🚀 Starting ChatRank services..."
echo ""

# Check if Python service is running
if ! lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo "📦 Starting Python service on port 8001..."
    cd python-service
    uvicorn app:app --reload --port 8001 &
    PYTHON_PID=$!
    cd ..
    sleep 3
else
    echo "✅ Python service already running on port 8001"
    PYTHON_PID=""
fi

# Check if Node backend is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "📦 Starting Node backend on port 3000..."
    cd node-backend
    npm run dev &
    NODE_PID=$!
    cd ..
    sleep 3
else
    echo "✅ Node backend already running on port 3000"
    NODE_PID=""
fi

# Check if React frontend is running (on port 3001 to avoid conflict with Node backend)
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "📦 Starting React frontend on port 3001..."
    cd frontend
    PORT=3001 npm start &
    FRONTEND_PID=$!
    cd ..
    sleep 3
else
    echo "✅ React frontend already running on port 3001"
    FRONTEND_PID=""
fi

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Services:"
echo "   - Python: http://localhost:8001"
echo "   - Node Backend: http://localhost:3000"
echo "   - React Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $PYTHON_PID $NODE_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

