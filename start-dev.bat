@echo off
REM OpenDecision Development Environment Startup (Simple Batch Version)
REM This file calls the PowerShell script

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1" %*
pause
