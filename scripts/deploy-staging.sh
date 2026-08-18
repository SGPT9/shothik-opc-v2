#!/bin/bash
set -e

echo "🚀 [Shothik Hermes] Starting 1-Click Staging Deployment..."

# 1. Typecheck & Unit Tests
echo "🔍 Running Typecheck & Automated Test Suite..."
node artifacts/shothik/run_typecheck.cjs
pnpm test:api

# 2. Build Frontend & API Server
echo "📦 Building Frontend Distribution Bundle..."
pnpm --filter @workspace/shothik run build

# 3. Spin up Docker Staging Stack
echo "🐳 Deploying Staging Container Stack..."
docker-compose down || true
docker-compose up -d --build

echo "✅ [Shothik Hermes] Staging Stack is Live!"
echo "🌐 Frontend & API Gateway: http://localhost:8080"
echo "🔌 Local Ollama Daemon Bridge: Port 11434"
