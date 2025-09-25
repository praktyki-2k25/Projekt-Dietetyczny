@echo off
echo ===================================
echo Instalacja wszystkich zaleznosci aplikacji
echo ===================================
echo.

echo 1. Tworzenie wymaganych folderow...
if not exist "uploads" mkdir uploads
if not exist "uploads\meals" mkdir uploads\meals

echo 2. Instalacja zaleznosci Node.js (Backend)...
call npm install

echo 3. Instalacja zaleznosci Node.js (Frontend)...
cd frontend
call npm install
cd ..

echo 4. Konfiguracja Python...
cd ai_service
if not exist "venv" (
    echo Tworzenie wirtualnego srodowiska Python...
    python -m venv venv
)

echo 5. Instalacja zaleznosci Python...
call venv\Scripts\activate
pip install fastapi uvicorn python-multipart pillow pydantic python-dotenv langchain langchain-openai
pip install -r requirements.txt 2>nul
cd ..

echo.
echo Instalacja zakonczona!
echo.
echo Teraz mozesz uruchomic aplikacje za pomoca:
echo start_all.bat
echo.
pause
