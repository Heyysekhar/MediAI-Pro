@echo off
echo ========================================
echo    MediAI Pro - Quick Start Script
echo    AI Healthcare System Setup
echo ========================================
echo.

echo [STEP 1] Checking Python version...
if not exist "..\venv\Scripts\python.exe" (
    echo Creating project virtual environment...
    python -m venv ..\venv
    if errorlevel 1 (
        echo ERROR: Could not create the Python virtual environment.
        pause
        exit /b 1
    )
)
set "PYTHON=..\venv\Scripts\python.exe"
set "PIP=..\venv\Scripts\python.exe -m pip"
%PYTHON% --version
if errorlevel 1 (
    echo ERROR: Python not found! Install Python 3.11+ from python.org
    pause
    exit /b 1
)

echo.
echo [STEP 2] Installing backend dependencies...
cd backend
%PIP% install -r requirements.txt
echo Backend dependencies installed!

echo.
echo [STEP 3] Training AI models...
cd ..\ml_models
python train_models.py
echo AI models trained!

echo.
echo [STEP 4] Starting backend server...
cd ..\backend
start "MediAI Backend" cmd /k "%PYTHON% -m uvicorn main:app --reload --port 8000"
echo Backend started on http://localhost:8000

echo.
echo [STEP 5] Installing frontend dependencies...
cd ..\frontend
call npm install
echo Frontend dependencies installed!

echo.
echo [STEP 6] Starting frontend...
start "MediAI Frontend" cmd /k "npm start"
echo Frontend starting on http://localhost:3000

echo.
echo ========================================
echo    MediAI Pro is STARTING UP!
echo ========================================
echo.
echo    Backend API:  http://localhost:8000
echo    API Docs:     http://localhost:8000/docs
echo    Frontend:     http://localhost:3000
echo.
echo    Make sure MongoDB and Redis are running!
echo    MongoDB: mongod
echo    Redis:   redis-server
echo.
pause
