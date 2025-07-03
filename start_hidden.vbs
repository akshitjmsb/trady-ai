Set WshShell = CreateObject("WScript.Shell")

' Start backend
WshShell.Run "cmd /c """"%CD%\venv\Scripts\python.exe"" ""%CD%\main.py""", 0, False

' Wait for backend to start
WScript.Sleep 3000

' Start frontend
WshShell.Run "cmd /c ""cd /d ""%CD%\frontend"" && npm run dev""", 0, False

' Wait for frontend to start
WScript.Sleep 5000

' Open browser
WshShell.Run "http://localhost:3000", 0, False

' Show a message
WshShell.Popup "Trady AI is running!" & vbCrLf & "Backend: http://localhost:8000" & vbCrLf & "Frontend: http://localhost:3000", 5, "Trady AI Launcher", 64
