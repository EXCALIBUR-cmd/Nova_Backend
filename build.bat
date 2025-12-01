@echo off
REM Chat App - Pre-Deployment Build Script (Windows)
REM This script builds both frontend and backend for production

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Chat App - Pre-Deployment Build
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed
    pause
    exit /b 1
)

echo Node version:
node --version
echo.

REM Step 1: Frontend Build
echo Step 1: Building Frontend...
cd Frontend
echo Installing dependencies...
call npm ci
if errorlevel 1 (
    echo Error: Frontend dependency installation failed
    pause
    exit /b 1
)

echo Building production bundle...
call npm run build
if errorlevel 1 (
    echo Error: Frontend build failed
    pause
    exit /b 1
)

if exist "dist" (
    echo [OK] Frontend build successful
    for /f %%A in ('powershell -Command "[Math]::Round((Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)"') do (
        echo      Bundle size: %%A MB
    )
) else (
    echo Error: Frontend build failed - dist folder not found
    pause
    exit /b 1
)

cd ..
echo.

REM Step 2: Backend Check
echo Step 2: Checking Backend...
cd Backend
echo Installing dependencies...
call npm ci
if errorlevel 1 (
    echo Error: Backend dependency installation failed
    pause
    exit /b 1
)

REM Check for required environment variables
set "MISSING_VARS="
if not defined MONGODB_URI (
    if not exist ".env" (
        set "MISSING_VARS=!MISSING_VARS!MONGODB_URI "
    )
)
if not defined GROQ_API_KEY (
    if not exist ".env" (
        set "MISSING_VARS=!MISSING_VARS!GROQ_API_KEY "
    )
)
if not defined JWT_SECRET (
    if not exist ".env" (
        set "MISSING_VARS=!MISSING_VARS!JWT_SECRET "
    )
)

if not "!MISSING_VARS!"=="" (
    echo Warning: Missing environment variables:
    for %%V in (!MISSING_VARS!) do echo   - %%V
    echo.
    echo Create a .env file with these variables before deployment.
) else (
    echo [OK] Environment variables configured
)

REM Check server.js exists
if exist "server.js" (
    echo [OK] Server entry point found
) else (
    echo Error: server.js not found
    pause
    exit /b 1
)

cd ..
echo.

REM Step 3: Summary
echo ========================================
echo Build Summary
echo ========================================
echo.
echo [OK] Frontend: Production build ready (dist/)
echo [OK] Backend: Dependencies installed (node_modules/)
echo.
echo Next steps for deployment:
echo 1. Set environment variables on your hosting platform:
echo    - MONGODB_URI
echo    - GROQ_API_KEY
echo    - JWT_SECRET
echo    - FRONTEND_URL
echo.
echo 2. Choose a deployment platform:
echo    - Render.com (Recommended)
echo    - Vercel + Railway
echo    - Heroku
echo.
echo 3. See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
echo Ready to deploy!
echo.
pause
