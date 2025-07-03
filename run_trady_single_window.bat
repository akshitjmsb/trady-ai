@echo off
title Trady AI - DO NOT CLOSE

echo Starting Trady AI...
echo.

echo [1/3] Starting FastAPI backend...
start "Trady Backend" /min cmd /k "cd /d "%~dp0" && .\venv\Scripts\activate && uvicorn main:app --reload"

echo [2/3] Starting Next.js frontend...
start "Trady Frontend" /min cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Opening browser...
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ===================================
echo Trady AI is now running!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo To stop the application, close this window.
echo ===================================
echo.
pause
