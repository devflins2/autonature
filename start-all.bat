@echo off
echo 🚀 Starting Autopost Automation Platform...

echo 📂 Starting Backend Server...
start cmd /k "cd server && npm run dev"

echo 🎨 Starting Frontend Dashboard...
start cmd /k "cd client && npm run dev"

echo ✅ Both services are starting in separate windows.
echo 🌐 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:5173
pause
