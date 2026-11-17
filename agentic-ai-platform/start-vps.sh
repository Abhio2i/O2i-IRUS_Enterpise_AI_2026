#!/bin/bash
cd /var/www/ai-agentic-backend
echo "[1/3] Stopping any old process on port 9095..."
fuser -k 9095/tcp 2>/dev/null

echo "[2/3] Loading clean environment variables from .env..."
set -a
source .env
set +a

echo "[3/3] Starting Spring Boot backend on port 9095..."
nohup java -jar agentic-ai-platform-0.1.0-SNAPSHOT.jar --server.port=9095 > backend.log 2>&1 &

sleep 6
echo "=== Port Check ==="
ss -tulnp | grep 9095 || netstat -tulnp | grep 9095
echo "=== Latest Logs ==="
tail -n 25 backend.log

