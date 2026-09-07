# NityaGeeta Backend Server Starter (PowerShell)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting NityaGeeta FastAPI Backend... " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$pythonExe = Join-Path $scriptDir ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    Write-Host "[ERROR] Virtual environment not found at $pythonExe" -ForegroundColor Red
    Write-Host "Please ensure the Python virtual environment is installed." -ForegroundColor Red
    exit 1
}

# 1. Check if port 8000 is ALREADY running and healthy
try {
    $healthCheck = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($healthCheck -and $healthCheck.status -eq "healthy") {
        Write-Host "`n[SUCCESS] NityaGeeta Backend is ALREADY running and healthy on port 8000!" -ForegroundColor Green
        Write-Host "  API URL:      http://127.0.0.1:8000" -ForegroundColor Cyan
        Write-Host "  Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
        Write-Host "`nYou do not need to start another instance. You can use NityaGeeta now.`n" -ForegroundColor Yellow
        exit 0
    }
} catch {
    # Port is free or not responding, proceed with startup
}

# 2. Check if a stale process is holding port 8000
$existingConn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingConn) {
    $stalePid = $existingConn.OwningProcess
    Write-Host "[NOTICE] Port 8000 is currently occupied by PID $stalePid." -ForegroundColor Yellow
    Write-Host "Terminating stale process to cleanly rebind..." -ForegroundColor DarkGray
    Stop-Process -Id $stalePid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host "Python Runtime: $pythonExe" -ForegroundColor Green
Write-Host "Backend API:    http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server.`n" -ForegroundColor DarkGray

# Using 127.0.0.1 avoids Windows Defender Firewall socket permission restrictions (WinError 10013)
& $pythonExe -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
