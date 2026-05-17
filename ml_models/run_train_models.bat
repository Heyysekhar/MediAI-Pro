@echo off
pushd %~dp0
set PYTHON=%~dp0..\backend\venv311\Scripts\python.exe
if not exist "%PYTHON%" (
  echo Virtual environment not found at %PYTHON%
  echo Please create or activate backend\venv311 first.
  popd
  exit /b 1
)
"%PYTHON%" "%~dp0train_models.py"
popd
