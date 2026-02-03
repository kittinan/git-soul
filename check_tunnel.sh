#!/bin/bash
# Quick Cloudflare Tunnel Check

echo "🔍 Checking Cloudflare Tunnel Status..."
echo ""

# Check cloudflared process
CLOUDFLARED_PID=$(pgrep -f "cloudflared tunnel" | head -1)

if [ -z "$CLOUDFLARED_PID" ]; then
    echo "❌ cloudflared not running"
    echo ""
    echo "🚀 Starting cloudflared tunnel for frontend (port 3000)..."
    ~/cloudflared tunnel --url http://localhost:3000 --loglevel info > /tmp/cf_tunnel.log 2>&1 &
    echo "✅ cloudflared started"
    echo ""
    echo "⏳ Waiting 15 seconds for tunnel to be ready..."
    sleep 15

    # Check for tunnel URL
    TUNNEL_URL=$(grep -m 1 "https://.*trycloudflare.com" /tmp/cf_tunnel.log | head -1)

    if [ -n "$TUNNEL_URL" ]; then
        echo ""
        echo "✅ Frontend Tunnel URL: $TUNNEL_URL"
        echo ""
        echo "🌐 You can access GitSoul at: $TUNNEL_URL"
        echo ""
        echo "📊 Backend tunnel:"
        echo "Backend API: http://localhost:8000"
        echo "Backend Tunnel: Will be on similar URL"
    else
        echo ""
        echo "❌ Tunnel URL not found in logs"
        echo "📝 Check logs: tail -100 /tmp/cf_tunnel.log"
    fi
else
    echo "✅ cloudflared running (PID: $CLOUDFLARED_PID)"
    echo ""
    echo "🔍 Checking logs for tunnel URL..."
    sleep 10

    # Check recent logs
    TUNNEL_URL=$(grep -m 1 "https://.*trycloudflare.com" /tmp/cf_tunnel.log | tail -1)

    if [ -n "$TUNNEL_URL" ]; then
        echo ""
        echo "✅ Frontend Tunnel URL: $TUNNEL_URL"
        echo ""
        echo "🌐 Access GitSoul at: $TUNNEL_URL"
    else
        echo ""
        echo "⏳ Tunnel still initializing..."
        echo "📝 Check logs: tail -100 /tmp/cf_tunnel.log"
    fi
fi

echo ""
echo "💡 Tips:"
echo "- If tunnel doesn't work, try stopping and restarting"
echo "- Check firewall settings"
echo "- Make sure ports 3000 and 8000 are not blocked"
