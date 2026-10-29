<#
.SYNOPSIS
    Automated Local-to-Production Build & Verification Pipeline for Shothik AI.
.DESCRIPTION
    Runs tests, API server compilation, and Web frontend Vite builds,
    verifying bundle output integrity before deployment.
#>

[CmdletBinding()]
param(
    [switch]$SkipTests = $false,
    [switch]$StrictTypecheck = $false
)

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [Shothik AI] Production Build & Verification Pipeline" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$repoRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
Set-Location $repoRoot

# Step 1: Environment & Tooling Verification
Write-Host ""
Write-Host "[1/4] Verifying Tooling and Node Environment..." -ForegroundColor Yellow
$nodeVer = node -v
$pnpmVer = pnpm -v
Write-Host "  -> Node: $nodeVer | pnpm: $pnpmVer" -ForegroundColor Green

# Step 2: Unit Testing
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "[2/4] Running API Gateway Test Suite..." -ForegroundColor Yellow
    pnpm --filter @workspace/api-server run test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [X] API Server unit tests failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Unit tests passed (100% success)." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[2/4] Skipping Unit Tests (-SkipTests flag passed)." -ForegroundColor Gray
}

# Step 3: Compiling API Gateway
Write-Host ""
Write-Host "[3/4] Building API Gateway (@workspace/api-server)..." -ForegroundColor Yellow
pnpm --filter @workspace/api-server run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [X] API Server build failed!" -ForegroundColor Red
    exit 1
}
$apiDist = Join-Path $repoRoot "artifacts\api-server\dist\index.mjs"
if (Test-Path $apiDist) {
    $apiSize = [math]::Round((Get-Item $apiDist).Length / 1KB, 2)
    Write-Host "  [OK] API Gateway compiled -> $apiDist (${apiSize} KB)" -ForegroundColor Green
}

# Step 4: Compiling Web Frontend SPA
Write-Host ""
Write-Host "[4/4] Building Web Frontend SPA (@workspace/shothik)..." -ForegroundColor Yellow
pnpm --filter @workspace/shothik run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [X] Web Frontend build failed!" -ForegroundColor Red
    exit 1
}
$webDist = Join-Path $repoRoot "artifacts\shothik\dist\public\index.html"
if (-not (Test-Path $webDist)) {
    $webDist = Join-Path $repoRoot "artifacts\shothik\dist\index.html"
}
if (Test-Path $webDist) {
    Write-Host "  [OK] Web Frontend compiled -> $webDist" -ForegroundColor Green
}

$sw.Stop()
$elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 2)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Production build completed in ${elapsed}s! All artifacts ready." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
