@echo off
echo ===================================
echo      APLIKACJA DIETETYCZNA
echo ===================================
echo.

echo 1. Tworzenie wymaganych folderow...
if not exist "uploads" mkdir uploads
if not exist "uploads\meals" mkdir uploads\meals

echo 2. Uruchamianie serwisu AI...
start cmd /k "cd ai_service && venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo 3. Uruchamianie backendu...
start cmd /k "npm start"

echo 4. Uruchamianie frontendu...
start cmd /k "cd frontend && npm run dev"

echo.
echo Aplikacja uruchomiona!
echo.
echo Frontend: http://localhost:3000 
echo Backend API: http://localhost:5000 
echo Serwis AI: http://localhost:8000
echo.
echo Dane testowego konta:
echo Email: test@example.com
echo Haslo: haslo123
echo.
echo Aby zatrzymac aplikacje, zamknij wszystkie okna terminala.
echo.
pause