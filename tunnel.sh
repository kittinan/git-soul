#!/bin/bash
# GitSoul Tunnel Script - Expose frontend (3000) and backend (8000)

echo "🚀 Starting GitSoul tunnels..."
echo ""

# Tunnel 1: Frontend (port 3000)
echo "📡 Tunnel 1: Frontend (port 3000)"
npx localtunnel --port 3000 --subdomain gitsoul-frontend &
FRONTEND_PID=$!

# Tunnel 2: Backend (port 8000)
echo "📡 Tunnel 2: Backend (port 8000)"
npx localtunnel --port 8000 --subdomain gitsoul-backend &
BACKEND_PID=$!

echo ""
echo "✅ Tunnels started!"
echo ""
echo "🌐 Frontend URL: https://gitsoul-frontend.localtunnel.me"
echo "🔌 Backend API: https://gitsoul-backend.localtunnel.me"
echo ""
echo "Press Ctrl+C to stop all tunnels"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping tunnels..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    echo "✅ Tunnels stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
