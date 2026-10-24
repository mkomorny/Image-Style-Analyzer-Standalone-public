@echo off
title Image Style Analyzer (Desktop)
cd /d "%~dp0"
call npm run electron:dev
pause