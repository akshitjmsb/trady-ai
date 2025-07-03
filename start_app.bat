@echo off
title Trady AI Launcher

echo Starting Trady AI...

REM Start FastAPI backend in a minimized window
start "" /min cmd /c "cd /d "%~dp0" && .\venv\Scripts\activate && uvicorn main:app --reload"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start Next.js frontend in a minimized window
start "" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

REM Open the browser after a short delay
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo Trady AI is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close this window to stop all services.
pause
