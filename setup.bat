@echo off
setlocal enabledelayedexpansion

:: Get the directory where the script is located
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Check for Administrator rights
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] This script requires Administrator rights to install dependencies.
    echo Please right-click setup.bat and select 'Run as administrator'.
    pause
    exit /b 1
)

echo ==========================================
echo Lumina Local Setup ^& Run Script
echo ==========================================

echo [1/6] Checking dependencies...

:: Install Python
python --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing Python via winget...
    call winget install -e --id Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
) else (
    echo Python is already installed.
)

:: Install Node.js
node --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing Node.js via winget...
    call winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
) else (
    echo Node.js is already installed.
)

:: Install PostgreSQL
psql --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing PostgreSQL 15 via winget...
    call winget install -e --id PostgreSQL.PostgreSQL.15 --silent --accept-package-agreements --accept-source-agreements
) else (
    echo PostgreSQL is already installed.
)

:: Refresh Path
set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin;C:\Program Files\Python311;C:\Program Files\nodejs"

echo [2/6] Setting up Backend...
cd /d "%PROJECT_ROOT%backend"
if not exist venv (
    echo Creating virtual environment...
    call python -m venv venv
)

echo Installing Python requirements...
call venv\Scripts\activate
call python -m pip install --upgrade pip
call python -m pip install -r requirements.txt

echo [3/6] Configuring Database...
set "PGPASSWORD=postgres"
if exist ..\.env (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DB_PASSWORD=" ..\.env') do set PGPASSWORD=%%a
)
set PGPASSWORD=%PGPASSWORD: =%
set PGPASSWORD=%PGPASSWORD:"=%

echo Checking if database 'lumina' exists...
call psql -U postgres -h localhost -p 5432 -lqt | findstr /C:"lumina" >nul
if %ERRORLEVEL% neq 0 (
    echo Creating database 'lumina'...
    call createdb -U postgres -h localhost -p 5432 lumina
) else (
    echo Database 'lumina' already exists.
)

echo [4/6] Running Migrations and Seeding...
echo Applying migrations (alembic)...
call alembic upgrade head
echo Seeding data...
call python scripts/seed.py

echo [5/6] Setting up Frontend...
cd /d "%PROJECT_ROOT%frontend"
echo Installing npm packages...
call npm install

echo [6/6] Launching Application...
echo.
echo Starting Backend in a new window...
start "Lumina Backend" cmd /k "cd /d "%PROJECT_ROOT%backend" && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo Starting Frontend...
call npm run dev

pause
