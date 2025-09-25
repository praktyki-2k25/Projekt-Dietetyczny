@echo off
echo ===================================
echo Uruchamianie frontendu z pelnym logowaniem
echo ===================================
echo.

cd C:\Users\szczo\Desktop\ProjektDiet\Projekt-Dietetyczny\frontend

echo Sprawdzanie zaleznosci...
call npm install

echo.
echo Najpierw sprobujmy usunac blokade portu 3000...
echo Szukanie i zamykanie procesu na porcie 3000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Znaleziono proces PID: %%a na porcie 3000
    echo Zamykanie procesu...
    taskkill /F /PID %%a
)

echo.
echo Uruchamianie frontendu z logowaniem...
echo.
echo Wyniki pojawia sie w tym oknie. Otwórz przeglądarkę i wejdz na http://localhost:3000
echo.
echo Jeśli frontend uruchomi się pomyślnie, zobaczysz komunikat "ready in x ms"
echo.

set DEBUG=vite:*
npx vite --host

echo.
echo Frontend zatrzymany.
echo.
pause