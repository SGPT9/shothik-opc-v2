# Windows PowerShell 1-Click Staging Deploy Script for Shothik Hermes

Write-Host "🚀 [Shothik Hermes] Starting 1-Click Staging Deployment..." -ForegroundColor Cyan

# 1. Typecheck & Unit Tests
Write-Host "🔍 Running Typecheck & Automated Test Suite..." -ForegroundColor Yellow
node artifacts/shothik/run_typecheck.cjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Typecheck failed! Aborting deployment."
    exit 1
}

pnpm test:api
if ($LASTEXITCODE -ne 0) {
    Write-Error "Unit tests failed! Aborting deployment."
    exit 1
}

# 2. Build Frontend & API Server
Write-Host "📦 Building Frontend Distribution Bundle..." -ForegroundColor Yellow
pnpm --filter @workspace/shothik run build

# 3. Spin up Docker Staging Stack
Write-Host "🐳 Deploying Staging Container Stack..." -ForegroundColor Yellow
docker-compose down
docker-compose up -d --build

Write-Host "✅ [Shothik Hermes] Staging Stack is Live!" -ForegroundColor Green
Write-Host "🌐 Frontend & API Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔌 Local Ollama Daemon Bridge: Port 11434" -ForegroundColor Cyan
