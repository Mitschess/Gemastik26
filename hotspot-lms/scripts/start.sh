#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== EduLAN + AI ==="
docker compose up -d --build
sleep 8
docker compose exec ollama ollama pull qwen2.5:1.5b

echo ""
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo "Server: http://${IP:-localhost}:5000"
echo "Guru:   http://${IP:-localhost}:5000/teacher.html"
