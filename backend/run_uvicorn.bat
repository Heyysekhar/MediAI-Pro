@echo off
pushd %~dp0
set VENV_PYTHON=%~dp0venv311\Scripts\python.exe
if not exist "%VENV_PYTHON%" (
  echo Virtual environment python not found at: %VENV_PYTHON%
  echo Please create or activate backend\venv311 first.
  popd
  exit /b 1
)
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "try { if (-not (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue)) { Write-Host 'free' } else { Write-Host 'busy' } } catch { Write-Host 'busy' }"`) do set PORT_STATUS=%%P
if "%PORT_STATUS%"=="busy" (
  set PORT=8001
) else (
  set PORT=8000
)
"%VENV_PYTHON%" -m uvicorn main:app --port %PORT%
echo Backend started on http://127.0.0.1:%PORT%
popd
