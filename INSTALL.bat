@echo off
REM Bitcoin Predictor - Windows Installation Script

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Bitcoin Predictor - Windows Quick Installation       ║
echo ║  100% FREE - No API Keys Needed                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js/npm not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Install dependencies
echo Installing dependencies (1-2 minutes)...
echo.
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo ✓ Installation complete!
echo.
echo ════════════════════════════════════════════════════════
echo NEXT STEPS:
echo ════════════════════════════════════════════════════════
echo.
echo 1. Get Telegram Chat ID:
echo    Open PowerShell and run:
echo    Invoke-WebRequest "https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/getUpdates" ^| Select Content
echo.
echo    Look for: "chat":{"id":XXXXXXX}
echo    Copy that number
echo.
echo 2. Edit .env file:
echo    notepad .env
echo.
echo    Change:
echo    - TELEGRAM_CHAT_ID=your_number
echo    - ADMIN_PASSWORD=your_password
echo.
echo 3. Start dashboard:
echo    npm run dev-admin
echo.
echo 4. Open browser:
echo    http://localhost:3000
echo    Login: admin / your_password
echo.
echo 5. Test Telegram:
echo    Send /help to your bot
echo.
echo ════════════════════════════════════════════════════════
echo.
pause
