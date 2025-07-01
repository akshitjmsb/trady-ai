@echo off
ECHO Starting Trady AI...

REM Get the directory of the batch file
set "BATCH_DIR=%~dp0"

ECHO Starting FastAPI backend...
start "Trady Backend" cmd /k "cd /d \"%BATCH_DIR%\" && call venv\Scripts\activate && uvicorn main:app --reload"

ECHO Starting Next.js frontend...
start "Trady Frontend" cmd /k "cd /d \"%BATCH_DIR%frontend\" && npm run dev"

ECHO Both servers are starting in separate windows.
