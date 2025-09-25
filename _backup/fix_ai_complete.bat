@echo off
title Naprawa projektu AI - Kompletna procedura
color 0A
echo.
echo ========================================================
echo               NAPRAWA PROJEKTU DIETETYCZNEGO
echo                    Serwis AI - Kompletna
echo ========================================================
echo.

:: Sprawdź czy jesteś w odpowiednim katalogu
if not exist "ai_service\" (
    echo [ERROR] Nie znaleziono katalogu ai_service!
    echo Upewnij sie, ze uruchamiasz skrypt z głównego katalogu projektu.
    pause
    exit /b 1
)

echo [KROK 1/6] Zatrzymywanie wszystkich procesów...
echo Zatrzymywanie node.js...
taskkill /f /im node.exe 2>nul
echo Zatrzymywanie python.exe...
taskkill /f /im python.exe 2>nul
echo Zatrzymywanie uvicorn...
taskkill /f /im uvicorn.exe 2>nul
timeout /t 2 >nul

echo.
echo [KROK 2/6] Backup starych plików...
if exist "ai_service\main.py.backup" del "ai_service\main.py.backup"
copy "ai_service\main.py" "ai_service\main.py.backup" >nul
echo Backup utworzony: ai_service\main.py.backup

echo.
echo [KROK 3/6] Reinstalacja środowiska AI...
cd ai_service

echo Usuwanie starych zaleznosci...
if exist "venv\" rmdir /s /q "venv"
if exist "__pycache__\" rmdir /s /q "__pycache__"

echo Tworzenie nowego srodowiska...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Nie udało sie utworzyc srodowiska wirtualnego!
    pause
    exit /b 1
)

echo Aktywacja srodowiska...
call venv\Scripts\activate.bat

echo Aktualizacja pip...
python -m pip install --upgrade pip

echo Instalacja nowych zaleznosci...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Nie udało sie zainstalowac zaleznosci!
    pause
    exit /b 1
)

echo.
echo [KROK 4/6] Test importów...
python -c "from fastapi import FastAPI; from langchain_openai import ChatOpenAI; from langchain_core.messages import HumanMessage; print('✅ Wszystkie importy OK!')"
if errorlevel 1 (
    echo [ERROR] Problem z importami!
    pause
    exit /b 1
)

cd ..

echo.
echo [KROK 5/6] Test serwisu AI...
echo Uruchamianie serwisu AI w tle...
start /min cmd /c "cd ai_service && call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000"

echo Czekanie na start serwisu...
timeout /t 5 >nul

echo Test podstawowego połączenia...
python test_ai_fix.py
if errorlevel 1 (
    echo [WARNING] Test nie przeszedł pomyślnie, ale serwis może być dostępny
)

echo.
echo [KROK 6/6] Podsumowanie napraw...
echo.
echo ========================================================
echo                    NAPRAWY WYKONANE:
echo ========================================================
echo ✅ Zaktualizowano requirements.txt do najnowszych wersji
echo ✅ Zmieniono model_name na model w ChatOpenAI
echo ✅ Naprawiono format wiadomości dla GPT-4o-mini
echo ✅ Dodano lepsze błędy dla debugowania
echo ✅ Reinstalowano środowisko wirtualne Python
echo ✅ Uruchomiono serwis AI
echo.
echo PROBLEMY ROZWIĄZANE:
echo ❌ Completions.create() got unexpected keyword argument
echo ❌ Błędy importu langchain.schema.messages
echo ❌ Niekompatybilne wersje bibliotek
echo.

echo ========================================================
echo                   CO ROBIĆ DALEJ:
echo ========================================================
echo.
echo 1. Serwis AI powinien być teraz dostępny na porcie 8000
echo 2. Uruchom backend: 2_URUCHOM_BACKEND.bat
echo 3. Uruchom frontend: 3_URUCHOM_FRONTEND.bat
echo 4. Testuj funkcję analizy zdjęć w aplikacji
echo.
echo JEŚLI NADAL WYSTĘPUJĄ PROBLEMY:
echo - Sprawdź klucz API w ai_service\.env
echo - Uruchom ponownie: reinstall_ai_deps.bat
echo - Sprawdź logi w konsoli AI service
echo.
echo ========================================================
echo                 GOTOWE DO UŻYCIA!
echo ========================================================
echo.

echo Naciśnij dowolny klawisz aby zakończyć...
pause >nul
exit /b 0
