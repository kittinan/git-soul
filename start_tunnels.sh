#!/bin/bash
# Start GitSoul Cloudflare Tunnels (Frontend + Backend)
# This script starts both tunnels and captures their URLs
# Use: ./start_tunnels.sh
# To stop: ./start_tunnels.sh stop
# To restart: ./start_tunnels.sh restart

TUNNELS_DIR="/tmp/gitsoul_tunnels"
FRONTEND_URL_FILE="$TUNNELS_DIR/frontend_url.txt"
BACKEND_URL_FILE="$TUNNELS_DIR/backend_url.txt"
CLOUDFLARED_LOG="/tmp/cloudflared_start.log"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all tunnels..."
    pkill -f cloudflared
    echo "✅ Tunnels stopped"
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Stop command
if [ "$1" == "stop" ]; then
    cleanup
fi

# Restart command
if [ "$1" == "restart" ]; then
    cleanup
    sleep 2
fi

# Start command
echo "🚀 Starting GitSoul Cloudflare Tunnels..."
echo ""

# Create tunnels directory
mkdir -p "$TUNNELS_DIR"

# Clear old log files
> "$CLOUDFLARED_LOG"
> "$FRONTEND_URL_FILE"
> "$BACKEND_URL_FILE"

echo "ℹ️  Starting both tunnels (frontend port 3000 + backend port 8000)..."
echo ""

# Start Frontend tunnel (port 3000)
~/cloudflared tunnel --url http://localhost:3000 --loglevel info >> "$CLOUDFLARED_LOG" 2>&1 &
FRONTEND_PID=$!

# Start Backend tunnel (port 8000)
~/cloudflared tunnel --url http://localhost:8000 --loglevel info >> "$CLOUDFLARED_LOG" 2>&1 &
BACKEND_PID=$!

echo "⏳ Waiting for tunnels to be ready (this may take 30-60 seconds)..."
echo "   Checking logs every 5 seconds..."
echo ""

# Poll for tunnel URLs (max 120 seconds = 2 minutes)
MAX_WAIT=120
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    sleep 5
    ELAPSED=$((ELAPSED + 5))

    # Check frontend URL
    FRONTEND_URL=$(grep -m 1 "https://.*\.trycloudflare\.com" "$CLOUDFLARED_LOG" | tail -1)
    if [ -n "$FRONTEND_URL" ]; then
        echo "$FRONTEND_URL" > "$FRONTEND_URL_FILE"
        echo "✅ Frontend tunnel URL found!"
    fi

    # Check backend URL
    BACKEND_URL=$(grep -m 2 "https://.*\.trycloudflare\.com" "$CLOUDFLARED_LOG" | tail -1)
    if [ -n "$BACKEND_URL" ]; then
        echo "$BACKEND_URL" > "$BACKEND_URL_FILE"
        echo "✅ Backend tunnel URL found!"
    fi

    # If both URLs found, break
    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
        break
    fi

    # Progress indicator
    printf "\r⏳ Progress: %3ds" "$ELAPSED"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Final check
FRONTEND_URL=$(cat "$FRONTEND_URL_FILE" 2>/dev/null)
BACKEND_URL=$(cat "$BACKEND_URL_FILE" 2>/dev/null)

if [ -z "$FRONTEND_URL" ] || [ -z "$BACKEND_URL" ]; then
    echo "❌ Failed to get tunnel URLs after ${MAX_WAIT}s"
    echo ""
    echo "📝 Debug: Last 20 lines of log:"
    tail -20 "$CLOUDFLARED_LOG"
    echo ""
    echo "💡 Tips:"
    echo "- Check if cloudflared is running: ps aux | grep cloudflared"
    echo "- Try stopping and restarting: ./start_tunnels.sh restart"
    echo "- Check firewall settings"
    echo "- Make sure ports 3000 and 8000 are available"
    cleanup
    exit 1
fi

# Success!
echo "✅ Both tunnels ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Tunnel URLs"
echo ""
echo "📡 Frontend (GitSoul):"
echo "   $FRONTEND_URL"
echo ""
echo "🔌 Backend API:"
echo "   $BACKEND_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Saved URLs to:"
echo "   $FRONTEND_URL_FILE"
echo "   $BACKEND_URL_FILE"
echo ""
echo "💡 Tips:"
echo "- Access these URLs directly (no need for cloudflared running after URLs are created)"
echo "- If URLs stop working, just restart: ./start_tunnels.sh restart"
echo "- To stop tunnels: ./start_tunnels.sh stop"
echo ""
echo "🎯 Local Access (if you prefer):"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""
echo "🧪 Test GitSoul with a public repo:"
echo "   https://github.com/vercel/next.js"
echo "   https://github.com/facebook/react"
echo ""
echo "🎉 GitSoul is LIVE!"
