#!/bin/bash
# ==============================================================================
# Automated Hostinger VPS Deployment Script for Shothik AI
# Target Host: srv1808169.hstgr.cloud (187.127.125.115)
# ==============================================================================

set -e

echo "🚀 Starting Shothik AI deployment on Hostinger VPS..."

# 1. Ensure Docker Network for Traefik exists
docker network create web-network 2>/dev/null || true

# 2. Check if .env file exists, otherwise copy from example
if [ ! -f .env ]; then
  echo "⚠️ .env file not found. Copying from .env.production.example..."
  cp .env.production.example .env
  echo "👉 Please update your .env file with your actual DEEPSEEK_API_KEY and INSFORGE_ANON_KEY!"
fi

# 3. Build and launch container stack
echo "📦 Building and starting Shothik AI production container..."
docker compose down || true
docker compose build --no-cache
docker compose up -d

# 4. Perform healthcheck verification
echo "🔍 Verifying application health..."
sleep 5
if curl -fsSL http://localhost:3000/health > /dev/null; then
  echo "✅ Shothik AI is LIVE and healthy on Hostinger VPS!"
  echo "🌐 Access via: https://srv1808169.hstgr.cloud or http://187.127.125.115:3000"
else
  echo "⚠️ Healthcheck did not respond immediately. Inspect logs via: docker logs shothik-ai"
fi
