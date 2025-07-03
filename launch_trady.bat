@echo off
start "" "%~dp0start_hidden.vbs"
taskkill /f /im wscript.exe >nul 2>&1
taskkill /f /im cmd.exe /fi "windowtitle eq start_hidden*" >nul 2>&1
exit
