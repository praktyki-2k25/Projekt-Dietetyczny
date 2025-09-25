@echo off
echo ===================================
echo Inicjalizacja bazy danych
echo ===================================
echo.

cd C:\Users\szczo\Desktop\ProjektDiet\Projekt-Dietetyczny

echo Inicjalizacja bazy danych...
node src\database\init.js

echo.
echo Jeśli nie było błędów, baza danych została poprawnie zainicjowana.
echo Teraz można uruchomić aplikację według instrukcji.
echo.
pause