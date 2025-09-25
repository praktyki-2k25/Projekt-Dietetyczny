@echo off
echo ===================================
echo Uruchamianie backendu (API)
echo ===================================
echo.
echo Upewniamy się, że baza danych istnieje...
if not exist "diet_app.db" (
  echo Baza danych nie istnieje. Uruchamiam inicjalizację...
  node src\database\init.js
  if %ERRORLEVEL% NEQ 0 (
    echo Błąd podczas inicjalizacji bazy danych
    pause
    exit /b
  )
)

cd C:\Users\szczo\Desktop\ProjektDiet\Projekt-Dietetyczny

REM Sprawdź port 5000 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Znaleziono proces na porcie 5000, kończę proces %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Tworzenie pliku .env dla backendu...
echo PORT=5000 > .env
echo NODE_ENV=development >> .env
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env
echo. >> .env
echo # Konfiguracja AI >> .env
echo AI_ENABLED=true >> .env
echo AI_SERVICE_URL=http://localhost:8000 >> .env

echo.
echo Instalacja zależności...
call npm install --no-audit --no-fund

echo.
echo Uruchamiam backend na porcie 5000...
npm start
