# Interactive Multi-Service Local Development Launcher for Shothik AI.

[CmdletBinding()]
param(
    [switch]$IncludeAI = $false
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [Shothik AI] Local Development Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$repoRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
Set-Location $repoRoot

Write-Host ""
Write-Host "Cleaning up stale processes on ports 5000, 5001, 8000, 8001 and 8080..." -ForegroundColor DarkYellow
foreach ($port in @(5000, 5001, 8000, 8001, 8080)) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $pid_ = $conn.OwningProcess
        if ($pid_ -and $pid_ -gt 0) {
            Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed PID $pid_ on port $port" -ForegroundColor DarkGray
        }
    }
}
Start-Sleep -Seconds 1
Write-Host ""
Write-Host "Starting Frontend (Port 5000) and API Gateway (Port 8080)..." -ForegroundColor Yellow

# Launch API Server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot'; Write-Host 'API Gateway on Port 8080' -ForegroundColor Cyan; pnpm --filter @workspace/api-server run dev"

# Optional AI Services
if ($IncludeAI) {
    $deerVenvPy = "D:\ai_venvs\deerflow\Scripts\python.exe"
    $deerBackendDir = Join-Path $repoRoot "deerflow_repo\backend"
    if ((Test-Path $deerVenvPy) -and (Test-Path $deerBackendDir)) {
        Write-Host "Starting DeerFlow Backend on Port 8000..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$deerBackendDir'; & '$deerVenvPy' -m uvicorn app.gateway.app:app --host 0.0.0.0 --port 8000"
    }

    $banglaVoicePy = "D:\ai_venvs\bangla-audio-ai\Scripts\python.exe"
    $banglaVoiceDir = Join-Path (Split-Path $repoRoot -Parent) "bangla-audio-ai"
    if (-not (Test-Path $banglaVoicePy)) {
        $banglaVoicePy = "python"
    }
    if (Test-Path (Join-Path $banglaVoiceDir "src\api\server.py")) {
        Write-Host "Starting Bangla Audio AI (OpenVINO Voice Service) on Port 8001..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$banglaVoiceDir'; & '$banglaVoicePy' -m src.api.server"
    }
}

# Start Frontend in current window
Write-Host "Starting Vite Web Frontend on Port 5000..." -ForegroundColor Green
pnpm --filter @workspace/shothik run dev
