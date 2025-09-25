@echo off
title Konfiguracja klucza API OpenAI
color 0C
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🔑 KONFIGURACJA API                       ║
echo ║                      KLUCZ OPENAI                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  UWAGA: Ten skrypt pomoże Ci bezpiecznie skonfigurować klucz API
echo.

:: Sprawdź czy plik .env istnieje
if exist "ai_service\.env" (
    echo 📁 Znaleziono plik ai_service\.env
    echo.
    findstr /B "OPENAI_API_KEY" "ai_service\.env" >nul
    if not errorlevel 1 (
        echo ✅ Klucz API już skonfigurowany w pliku .env
        echo.
        echo 🔄 Czy chcesz go zmienić?
        choice /c YN /m "Naciśnij Y aby zmienić lub N aby anulować"
        if errorlevel 2 goto :end
        if errorlevel 1 goto :configure
    ) else (
        echo ⚠️  Plik .env istnieje, ale brak klucza API
        goto :configure
    )
) else (
    echo 📂 Plik ai_service\.env nie istnieje - zostanie utworzony
    goto :configure
)

:configure
echo.
echo 📋 INSTRUKCJE:
echo ═══════════════════════════════════════════════════════════════
echo 1. Przejdź na: https://platform.openai.com/api-keys
echo 2. Zaloguj się do swojego konta OpenAI
echo 3. Kliknij "Create new secret key"
echo 4. Skopiuj klucz (zaczyna się od: sk-proj-...)
echo 5. Wklej go poniżej
echo.

:input_key
set /p "api_key=🔑 Wklej swój klucz API OpenAI: "

:: Sprawdź czy klucz został wprowadzony
if "%api_key%"=="" (
    echo ❌ Nie wprowadzono klucza!
    goto :input_key
)

:: Sprawdź czy klucz ma poprawny format
echo %api_key% | findstr /R "^sk-" >nul
if errorlevel 1 (
    echo ❌ Nieprawidłowy format klucza!
    echo 💡 Klucz powinien zaczynać się od "sk-"
    echo.
    choice /c YN /m "Czy chcesz spróbować ponownie? (Y/N)"
    if errorlevel 2 goto :end
    if errorlevel 1 goto :input_key
)

:: Sprawdź długość klucza
call :strlen api_key keylen
if %keylen% LSS 50 (
    echo ❌ Klucz wydaje się zbyt krótki (długość: %keylen%)
    echo 💡 Poprawny klucz ma zwykle 100+ znaków
    echo.
    choice /c YN /m "Czy na pewno chcesz użyć tego klucza? (Y/N)"
    if errorlevel 2 goto :input_key
)

:: Utwórz katalog jeśli nie istnieje
if not exist "ai_service" mkdir ai_service

:: Zapisz klucz do pliku .env
echo OPENAI_API_KEY=%api_key% > ai_service\.env
echo AI_SERVICE_PORT=8000 >> ai_service\.env

echo.
echo ✅ Klucz API został zapisany!
echo.
echo 📁 Lokalizacja: ai_service\.env
echo 🔒 Klucz: %api_key:~0,10%...(ukryty)
echo.

:: Test klucza
echo 🧪 Czy chcesz przetestować klucz API?
choice /c YN /m "Naciśnij Y aby przetestować lub N aby pominąć"
if errorlevel 1 (
    echo.
    echo 🔍 Testowanie klucza API...
    
    :: Sprawdź czy Python jest dostępny
    python --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python nie jest zainstalowany
        echo 💡 Zainstaluj Python aby przetestować klucz
    ) else (
        :: Test klucza
        cd ai_service
        if exist venv\Scripts\activate.bat (
            call venv\Scripts\activate.bat
            python -c "import openai, os; from dotenv import load_dotenv; load_dotenv(); client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY')); response = client.completions.create(model='gpt-3.5-turbo-instruct', prompt='Test', max_tokens=1); print('✅ Klucz API działa!'); print('Model:', response.model)" 2>nul
            if errorlevel 1 (
                echo ❌ Błąd testu klucza API
                echo 💡 Sprawdź czy klucz jest poprawny i czy masz środki na koncie
            )
        ) else (
            echo ⚠️  Brak środowiska Python - uruchom najpierw NAPRAW_AI_V2.bat
        )
        cd ..
    )
)

echo.
echo 🎉 KONFIGURACJA ZAKOŃCZONA!
echo.
echo 📋 NASTĘPNE KROKI:
echo    1️⃣  Uruchom naprawę: NAPRAW_AI_V2.bat
echo    2️⃣  Uruchom test:    TEST_AI_SZYBKO.bat  
echo    3️⃣  Uruchom AI:      1_URUCHOM_AI.bat
echo.
echo ⚠️  BEZPIECZEŃSTWO:
echo    • NIE udostępniaj pliku .env nikomu
echo    • NIE wklejaj klucza do kodu źródłowego
echo    • NIE wysyłaj klucza przez email/chat
echo.

:end
pause
exit /b 0

:: Funkcja do obliczania długości stringa
:strlen
setlocal enabledelayedexpansion
set "s=!%~1!#"
set "len=0"
for %%P in (4096 2048 1024 512 256 128 64 32 16 8 4 2 1) do (
    if "!s:~%%P,1!" NEQ "" (
        set /a "len+=%%P"
        set "s=!s:~%%P!"
    )
)
endlocal & set "%~2=%len%"
exit /b
