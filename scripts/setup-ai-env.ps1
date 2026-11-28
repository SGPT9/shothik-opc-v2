<#
.SYNOPSIS
    Automated Python & AI Environment Provisioner for Shothik AI on Windows.
.DESCRIPTION
    Creates isolated virtual environments on D:\ai_venvs to preserve C: SSD space,
    creates directory junctions (.venv) inside each subsystem, and configures Intel Arc GPU settings.
#>

[CmdletBinding()]
param(
    [string]$BaseStorageDir = "D:\ai_venvs",
    [string]$CacheDir = "D:\ai_cache",
    [switch]$InstallDeps = $false
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [Shothik AI] Python & AI Environment Provisioner" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Ensure Storage Directories on D:
Write-Host ""
Write-Host "[1/5] Checking Storage Targets on D: Drive..." -ForegroundColor Yellow
if (-not (Test-Path $BaseStorageDir)) {
    New-Item -ItemType Directory -Path $BaseStorageDir -Force | Out-Null
    Write-Host "  [OK] Created: $BaseStorageDir" -ForegroundColor Green
} else {
    Write-Host "  [OK] Exists: $BaseStorageDir" -ForegroundColor Green
}

$hfCache = Join-Path $CacheDir "huggingface"
$ollamaCache = Join-Path $CacheDir "ollama"
foreach ($dir in @($hfCache, $ollamaCache)) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  [OK] Created cache directory: $dir" -ForegroundColor Green
    }
}

# 2. Configure Environment Variables for User
Write-Host ""
Write-Host "[2/5] Setting Persistent User Environment Variables..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable('HF_HOME', $hfCache, 'User')
[System.Environment]::SetEnvironmentVariable('OLLAMA_MODELS', $ollamaCache, 'User')
Write-Host "  [OK] HF_HOME -> $hfCache" -ForegroundColor Green
Write-Host "  [OK] OLLAMA_MODELS -> $ollamaCache" -ForegroundColor Green

# 3. Check for Python & uv
Write-Host ""
Write-Host "[3/5] Checking Python Toolchain..." -ForegroundColor Yellow
$py = Get-Command python -ErrorAction SilentlyContinue
if ($py) {
    $pyVersion = python --version
    Write-Host "  [OK] Detected Python: $pyVersion" -ForegroundColor Green
} else {
    Write-Host "  [X] Python not found on PATH! Please install Python 3.11+." -ForegroundColor Red
    return
}

# Check uv
$uvCmd = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uvCmd) {
    Write-Host "  [!] 'uv' not found on PATH. Installing uv via pip..." -ForegroundColor Yellow
    python -m pip install --quiet uv
} else {
    $uvVer = uv --version
    Write-Host "  [OK] Detected uv: $uvVer" -ForegroundColor Green
}

# 4. Create Virtual Environments on D: and link via Junctions
Write-Host ""
Write-Host "[4/5] Provisioning Virtual Environments & Directory Junctions..." -ForegroundColor Yellow

$services = @(
    @{ Name = "deerflow"; TargetDir = "deerflow_repo\backend"; PyVersion = "3.12" },
    @{ Name = "bangla-audio-ai"; TargetDir = "..\bangla-audio-ai"; PyVersion = "3.11" }
)

$repoRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName

foreach ($svc in $services) {
    $svcName = $svc["Name"]
    $svcDir = $svc["TargetDir"]
    $pyVer = $svc["PyVersion"]
    $svcVenvPath = Join-Path $BaseStorageDir $svcName
    $localPath = Join-Path $repoRoot $svcDir
    $junctionPath = Join-Path $localPath ".venv"

    if (Test-Path $localPath) {
        Write-Host "  Processing: $svcDir..." -ForegroundColor Cyan

        # Create venv on D: if not existing
        $pyExe = Join-Path $svcVenvPath "Scripts\python.exe"
        if (-not (Test-Path $pyExe)) {
            Write-Host "    Creating isolated venv ($pyVer) at $svcVenvPath..." -ForegroundColor Gray
            python -m uv venv $svcVenvPath --python $pyVer | Out-Null
            if (-not (Test-Path $pyExe)) {
                python -m venv $svcVenvPath
            }
            Write-Host "    [OK] venv created at $svcVenvPath" -ForegroundColor Green
        } else {
            Write-Host "    [OK] venv already exists at $svcVenvPath" -ForegroundColor Green
        }

        # Create Junction in workspace
        if (-not (Test-Path $junctionPath)) {
            Write-Host "    Creating directory junction: $junctionPath -> $svcVenvPath..." -ForegroundColor Gray
            cmd /c mklink /J "$junctionPath" "$svcVenvPath" | Out-Null
            Write-Host "    [OK] Junction linked: $junctionPath" -ForegroundColor Green
        } else {
            Write-Host "    [OK] Junction already exists at $junctionPath" -ForegroundColor Green
        }
    }
}

# 5. Optional Dependency Installation
if ($InstallDeps) {
    Write-Host ""
    Write-Host "[5/5] Installing Dependencies with Intel Arc / DirectML Support..." -ForegroundColor Yellow
    
    # DeerFlow (pyproject.toml + harness package)
    $deerVenvPy = Join-Path $BaseStorageDir "deerflow\Scripts\python.exe"
    $deerBackendDir = Join-Path $repoRoot "deerflow_repo\backend"
    $harnessDir = Join-Path $deerBackendDir "packages\harness"
    if (Test-Path (Join-Path $deerBackendDir "pyproject.toml")) {
        Write-Host "  Installing DeerFlow dependencies with uv..." -ForegroundColor Cyan
        python -m uv pip install -p $deerVenvPy -e $harnessDir -e $deerBackendDir
    }

    # Bangla Audio AI (requirements.txt)
    $banglaVenvPy = Join-Path $BaseStorageDir "bangla-audio-ai\Scripts\python.exe"
    $banglaReq = Join-Path $repoRoot "..\bangla-audio-ai\requirements.txt"
    if (Test-Path $banglaReq) {
        Write-Host "  Installing Bangla Audio AI dependencies for Intel Arc B580 (OpenVINO)..." -ForegroundColor Cyan
        python -m uv pip install -p $banglaVenvPy -r $banglaReq
    }
} else {
    Write-Host ""
    Write-Host "[5/5] Skipping dependency download. (Run with -InstallDeps to install wheels)." -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Setup Complete! All venvs stored safely on D: Drive." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
