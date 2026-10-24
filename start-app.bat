@echo off
title Image Style Analyzer
cd /d "%~dp0"

if not exist "dist\server.cjs" (
  echo Building app - first run may take a moment...
  call npm run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)

echo.
echo  Image Style Analyzer
echo  http://127.0.0.1:3000
echo.
echo  Keep this window open while using the app.
echo  Press Ctrl+C to stop.
echo.

start "" "http://127.0.0.1:3000"
set NODE_ENV=production
node dist\server.cjs

echo.
echo Server stopped.
pause