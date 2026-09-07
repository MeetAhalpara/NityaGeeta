@echo off
title NityaGeeta Backend Server
echo =========================================
echo   Starting NityaGeeta FastAPI Backend...
echo =========================================
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at .venv\Scripts\python.exe
    pause
    exit /b 1
)

echo Checking if backend is already active on port 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue; if ($h -and $h.status -eq 'healthy') { Write-Host '[SUCCESS] NityaGeeta Backend is ALREADY running on port 8000!'; exit 0 } else { exit 1 }"
if %ERRORLEVEL% equ 0 (
    echo.
    echo Backend is already healthy and ready at http://127.0.0.1:8000
    echo You can use NityaGeeta now.
    echo.
    pause
    exit /b 0
)

echo [OK] Python Runtime: .venv\Scripts\python.exe
echo [OK] Backend API:    http://127.0.0.1:8000
echo [OK] Swagger Docs:   http://127.0.0.1:8000/docs
echo Press Ctrl+C to stop.
echo.

".venv\Scripts\python.exe" -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
pause
