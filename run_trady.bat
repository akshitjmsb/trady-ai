@echo off
set "BATCH_DIR=%~dp0"
echo Starting Trady AI Backend and Frontend...

REM Start FastAPI backend in a new window
start "Trady Backend" cmd /k "cd /d "%BATCH_DIR%" && uvicorn main:app --reload"

REM Start Next.js frontend in a new window
start "Trady Frontend" cmd /k "cd /d "%BATCH_DIR%frontend" && npm run dev"

REM Open Trady frontend in the default browser
start "" "http://localhost:3000"

pause
