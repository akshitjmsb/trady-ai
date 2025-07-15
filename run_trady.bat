@echo off
REM Batch script to start both FastAPI backend and Next.js frontend for Trady AI

REM Start backend (venv activation + FastAPI)
start "Backend" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"

REM Start frontend (Next.js)
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Optional: Wait for both windows to close before ending script
exit /b
