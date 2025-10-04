@echo off
echo.
echo ========================================
echo   🎯 Slate Intelligence Document Classifier
echo   Starting Full-Stack Application...
echo ========================================
echo.

echo 📂 Checking project structure...
if not exist "server\main.py" (
    echo ❌ Error: Backend server files not found!
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

if not exist "client\package.json" (
    echo ❌ Error: Frontend client files not found!
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

echo ✅ Project structure verified
echo.

echo 🐍 Starting Backend Server...
echo Starting FastAPI server on http://localhost:8000
echo API docs will be available at http://localhost:8000/docs
echo.
start "Backend Server" cmd /k "cd /d server && echo Starting FastAPI Backend... && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo ⚛️ Starting Frontend Client...
echo Starting React app on http://localhost:3000
echo.
start "Frontend Client" cmd /k "cd /d client && echo Starting React Frontend... && npm start"

echo.
echo 🎉 Both servers are starting up!
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 📝 Usage Instructions:
echo    1. Wait for both servers to fully start (should open automatically)
echo    2. Go to http://localhost:3000 in your browser
echo    3. Sign up for a new account or login
echo    4. Upload documents to classify them with AI
echo    5. View your classification history
echo.
echo ⚠️  To stop the servers: Close both terminal windows or press Ctrl+C
echo.
echo 🚀 Happy Classifying!
echo.
pause