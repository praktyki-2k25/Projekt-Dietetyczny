@echo off
title Serwis AI v2.0
color 0B
cls

echo.
echo ╔═══════════════════════════════════════╗
echo ║         SERWIS AI v2.0                ║
echo ║    Uruchamianie w trybie produkcji    ║
echo ╚═══════════════════════════════════════╝
echo.

:: Sprawdź lokalizację
if not exist "ai_service\" (
    echo ❌ Nie znaleziono katalogu ai_service!
    echo 💡 Uruchom z głównego katalogu projektu
    pause
    exit /b 1
)

echo 🔍 Sprawdzanie wymagań...

:: Sprawdź czy port 8000 jest wolny
netstat -an | findstr ":8000 " >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 8000 jest zajęty - zatrzymuję stary proces...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":8000"') do (
        taskkill /f /pid %%i >nul 2>&1
    )
    timeout /t 2 >nul
    echo ✅ Port 8000 zwolniony
)

:: Utwórz katalogi
if not exist "uploads" mkdir uploads >nul 2>&1
if not exist "uploads\meals" mkdir uploads\meals >nul 2>&1
echo ✅ Katalogi utworzone

:: Sprawdź .env
echo 🔑 Sprawdzanie konfiguracji...
if not exist "ai_service\.env" (
    echo ❌ Brak pliku .env!
    echo 💡 Uruchom najpierw: NAPRAW_AI_V2.bat
    pause
    exit /b 1
) else (
    echo ✅ Plik .env istnieje
)

cd ai_service

:: Sprawdź środowisko wirtualne
echo 🐍 Sprawdzanie środowiska Python...
if not exist "venv\" (
    echo ❌ Brak środowiska wirtualnego!
    echo 💡 Uruchom najpierw: NAPRAW_AI_V2.bat
    pause
    exit /b 1
)

echo ✅ Środowisko wirtualne OK

:: Aktywuj środowisko
call venv\Scripts\activate.bat

:: Sprawdź czy main.py istnieje
if not exist "main.py" (
    echo ❌ Brak pliku main.py!
    echo 💡 Uruchom: NAPRAW_AI_V2.bat
    pause
    exit /b 1
)

echo ✅ Plik main.py OK

:: Sprawdź biblioteki
echo 📦 Sprawdzanie bibliotek...
python -c "import fastapi, langchain_openai" >nul 2>&1
if errorlevel 1 (
    echo ❌ Brak wymaganych bibliotek!
    echo 💡 Uruchom: NAPRAW_AI_V2.bat
    pause
    exit /b 1
)

echo ✅ Biblioteki OK

echo.
echo ╔═══════════════════════════════════════╗
echo ║           🚀 URUCHAMIANIE             ║
echo ╚═══════════════════════════════════════╝
echo.
echo 🌐 Serwis AI będzie dostępny na:
echo    http://localhost:8000
echo.
echo 📋 Dostępne endpointy:
echo    GET  /          - Status serwisu
echo    GET  /test      - Test modelu AI  
echo    POST /analyze-meal        - Analiza tekstowa
echo    POST /analyze-meal-photo  - Analiza zdjęć
echo.
echo ⚡ Uruchamianie serwera...
echo    (Naciśnij Ctrl+C aby zatrzymać)
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info

echo.
echo ⚠️  Serwis AI został zatrzymany
pause
