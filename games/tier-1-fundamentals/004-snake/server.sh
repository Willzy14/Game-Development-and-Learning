#!/bin/bash
# Simple server management script for Snake game

case "$1" in
    start)
        echo "Starting server on port 8080..."
        cd /workspaces/Game-Development-and-Learning/games/tier-1-fundamentals/004-snake
        python3 -m http.server 8080 > /dev/null 2>&1 &
        echo "Server started! Access at: http://localhost:8080"
        echo "PID: $!"
        ;;
    stop)
        echo "Stopping server..."
        pkill -f "python3 -m http.server 8080"
        echo "Server stopped."
        ;;
    restart)
        echo "Restarting server..."
        pkill -f "python3 -m http.server 8080"
        sleep 1
        cd /workspaces/Game-Development-and-Learning/games/tier-1-fundamentals/004-snake
        python3 -m http.server 8080 > /dev/null 2>&1 &
        echo "Server restarted! Access at: http://localhost:8080"
        ;;
    status)
        if ps aux | grep -v grep | grep "python3 -m http.server 8080" > /dev/null; then
            echo "Server is RUNNING"
            ps aux | grep -v grep | grep "python3 -m http.server 8080"
        else
            echo "Server is NOT running"
        fi
        ;;
    *)
        echo "Usage: ./server.sh {start|stop|restart|status}"
        exit 1
        ;;
esac
