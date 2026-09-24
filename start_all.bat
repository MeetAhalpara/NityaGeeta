@echo off
title NityaGeeta Dual Launcher
echo ========================================================
echo   Launching NityaGeeta (FastAPI Backend + Next.js UI)
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Start Backend in a dedicated window
echo [1/2] Starting FastAPI Backend (Port 8000)...
start "NityaGeeta Backend (FastAPI)" cmd /k "call start_backend.bat"

:: 2. Wait 2 seconds for backend to bind port
timeout /t 2 /nobreak >nul

:: 3. Start Frontend in a dedicated window
echo [2/2] Starting Next.js Frontend (Port 1870)...
start "NityaGeeta Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both services launched successfully!
echo   * Web App:      http://localhost:1870/app
echo   * Backend API:  http://127.0.0.1:8000
echo   * API Docs:     http://127.0.0.1:8000/docs
echo ========================================================
echo.
timeout /t 4 >nul
exit /b 0
