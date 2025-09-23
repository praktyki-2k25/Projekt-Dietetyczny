@echo off
echo 🚀 Uruchamianie Aplikacji Dietetycznej
echo ======================================

:: Sprawdź czy Node.js jest zainstalowany
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js nie jest zainstalowany. Pobierz z https://nodejs.org
    pause
    exit /b 1
)

:: Sprawdź czy npm jest zainstalowany
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm nie jest zainstalowany
    pause
    exit /b 1
)

echo ✅ Node.js jest zainstalowany
echo ✅ npm jest zainstalowany
echo.

:: Backend
echo 🔧 Przygotowywanie backendu...
if not exist package.json (
    echo ❌ Nie znaleziono package.json w katalogu głównym
    pause
    exit /b 1
)

if not exist node_modules (
    echo 📦 Instalowanie zależności backendu...
    npm install
)

:: Frontend
echo 🔧 Przygotowywanie frontendu...
cd frontend

if not exist package.json (
    echo ❌ Nie znaleziono package.json w katalogu frontend
    pause
    exit /b 1
)

if not exist node_modules (
    echo 📦 Instalowanie zależności frontendu...
    npm install
)

cd ..

:: Inicjalizacja bazy danych
echo 🗄️ Inicjalizowanie bazy danych...
if not exist diet_app.db (
    npm run init-db
    echo ✅ Baza danych została zainicjalizowana
) else (
    echo ✅ Baza danych już istnieje
)

:: Tworzenie pliku .env jeśli nie istnieje
if not exist .env (
    echo ⚙️ Tworzenie pliku konfiguracyjnego .env...
    (
    echo # Konfiguracja serwera
    echo PORT=5000
    echo NODE_ENV=development
    echo.
    echo # JWT Secret ^(w produkcji użyj bezpiecznego klucza^)
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    echo.
    echo # AI Configuration
    echo AI_ENABLED=true
    echo.
    echo # Opcjonalnie: klucz API Claude ^(jeśli chcesz użyć własnego^)
    echo # CLAUDE_API_KEY=your_claude_api_key_here
    ) > .env
    echo ✅ Plik .env został utworzony
)

echo.
echo 🎉 Aplikacja jest gotowa do uruchomienia!
echo.
echo Aby uruchomić aplikację:
echo 1. Backend:  npm run dev     (w głównym katalogu)
echo 2. Frontend: npm run dev     (w katalogu frontend/)
echo.
echo Lub użyj:
echo npm run start-all  # Uruchamia backend i frontend jednocześnie
echo.
echo Aplikacja będzie dostępna pod adresem:
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo Konto testowe:
echo 📧 Email: test@example.com
echo 🔐 Hasło: haslo123
echo.
pause
