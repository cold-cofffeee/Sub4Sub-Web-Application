@echo off
echo ========================================
echo SUB4SUB v2.0 - Quick Start Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Checking Node.js version...
node --version
echo.

REM Check if MongoDB is running
echo [2/6] Checking MongoDB...
mongosh --eval "db.version()" >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB is not running!
    echo Starting MongoDB service...
    net start MongoDB >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start MongoDB
        echo Please install MongoDB or start it manually
        echo Download: https://www.mongodb.com/try/download/compass
        pause
        exit /b 1
    )
)
echo MongoDB is running
echo.

REM Install dependencies
echo [3/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Check if .env exists
echo [4/6] Checking environment configuration...
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo [WARNING] Please edit .env file with your settings
)
echo.

REM Run migration
echo [5/6] Running database migration...
call npm run migrate
if %errorlevel% neq 0 (
    echo [ERROR] Database migration failed
    pause
    exit /b 1
)
echo.

REM Generate views
echo [6/6] Generating view templates...
node scripts/generate-views.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate views
    pause
    exit /b 1
)
echo.

echo ========================================
echo Setup Complete! Ready to start.
echo ========================================
echo.
echo Admin Credentials:
echo   Email: admin@sub4sub.com
echo   Password: admin123
echo   (CHANGE THIS AFTER FIRST LOGIN!)
echo.
echo Starting server in 3 seconds...
timeout /t 3 >nul

echo.
echo ========================================
echo Starting SUB4SUB Server...
echo ========================================
echo.
echo Server will be available at:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm run dev
