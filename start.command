#!/bin/bash
# Double-click this file to start the VASSAL Module Builder.
# It launches the backend API and frontend dev server, then opens your browser.

cd "$(dirname "$0")"

echo "🔧 Starting VASSAL Module Builder..."
echo ""

# Start both servers
npm run dev &
DEV_PID=$!

# Wait for Vite to be ready, then open browser
sleep 3
open http://localhost:5173

echo ""
echo "✅ Running! Browser should open automatically."
echo "   Press Ctrl+C to stop."
echo ""

wait $DEV_PID
