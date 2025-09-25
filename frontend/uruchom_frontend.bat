@echo off
echo ===================================
echo Uruchamianie frontendu
echo ===================================
echo.

cd C:\Users\szczo\Desktop\ProjektDiet\Projekt-Dietetyczny\frontend

echo Naprawiam pliki konfiguracyjne...

echo Uruchamiam frontend...
npx vite --port 3000 --host

echo.
echo Frontend zatrzymany.
echo.
pause
