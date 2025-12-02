@echo off
echo Starting Wool Monitoring System...
echo.

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server in background...
start "FastAPI Server" python start_api.py

echo.
echo Waiting for API to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting React development server...
npm start

echo.
echo Both servers are now running:
echo - React App: http://localhost:3000
echo - FastAPI: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul