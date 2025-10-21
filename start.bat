@echo off
echo Installing dependencies...
npm install

echo.
echo Starting API server...
echo Server will run on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

npm start
