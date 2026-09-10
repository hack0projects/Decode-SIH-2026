@echo off
echo Starting CodeSeekho Servers...
echo.

echo [1/2] Starting Main Pipeline (Port 3010)...
start "CodeSeekho - Main Pipeline" cmd /k "cd /d "%~dp0backend-v3" && node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Study Tools Proxy (Port 5000)...
start "CodeSeekho - Study Tools Proxy" cmd /k "cd /d "%~dp0backend-v3" && node proxy.js"

echo.
echo ========================================
echo  CodeSeekho Unified Suite Started!
echo  Main App     : http://localhost:3010
echo  Study Tools  : http://localhost:3010/study-tools
echo  Standalone   : http://localhost:5000
echo ========================================
echo.
pause
