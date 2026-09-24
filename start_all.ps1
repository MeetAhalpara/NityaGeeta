# NityaGeeta Unified Launcher (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching NityaGeeta (FastAPI Backend + Next.js UI)   " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Start FastAPI Backend in a new window
Write-Host "`n[1/2] Launching Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $scriptDir "start_backend.ps1")

# Wait 2 seconds for Python to initialize
Start-Sleep -Seconds 2

# 2. Start Next.js Frontend in a new window
Write-Host "[2/2] Launching Frontend on http://localhost:1870 ..." -ForegroundColor Green
$frontendDir = Join-Path $scriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  NityaGeeta is launching in 2 separate terminals!" -ForegroundColor Green
Write-Host "  * Web App:      http://localhost:1870/app" -ForegroundColor Cyan
Write-Host "  * Backend API:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  * API Docs:     http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan
