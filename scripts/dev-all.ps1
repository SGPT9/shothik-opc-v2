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
Write-Host "Starting Frontend (Port 5000) and API Gateway (Port 8080)..." -ForegroundColor Yellow

# Launch API Server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot'; Write-Host 'API Gateway on Port 8080' -ForegroundColor Cyan; pnpm --filter @workspace/api-server run dev"

# Optional AI Services
if ($IncludeAI) {
    $deerVenvPy = "D:\ai_venvs\deerflow\Scripts\python.exe"
    if (Test-Path $deerVenvPy) {
        Write-Host "Starting DeerFlow Backend on Port 8000..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot\deer-flow-backend\backend'; & '$deerVenvPy' main.py"
    }
}

# Start Frontend in current window
Write-Host "Starting Vite Web Frontend on Port 5000..." -ForegroundColor Green
pnpm --filter @workspace/shothik run dev
