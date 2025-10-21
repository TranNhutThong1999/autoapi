@echo off
echo Installing dependencies...
npm install

echo.
echo Starting API server in development mode...
echo Server will run on http://localhost:3001
echo Auto-reload enabled
echo Press Ctrl+C to stop the server
echo.

npm run dev
