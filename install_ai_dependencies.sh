#!/bin/bash
# Skrypt do instalacji nowych zależności

echo "==================================="
echo "Instalacja zależności dla integracji AI"
echo "==================================="
echo ""

# Instalacja zależności dla backendu
echo "Instalacja zależności dla backendu..."
npm install multer form-data --save

# Sprawdzenie czy Python jest zainstalowany
if ! command -v python3 &> /dev/null; then
    echo "[BŁĄD] Python 3 nie jest zainstalowany"
    echo "Zainstaluj Python 3 za pomocą menedżera pakietów swojego systemu"
    exit 1
fi

# Instalacja zależności dla serwisu AI
echo ""
echo "Instalacja zależności Python dla serwisu AI..."
cd ai_service
if [ ! -d "venv" ]; then
    echo "Tworzenie wirtualnego środowiska Python..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
cd ..

echo ""
echo "Instalacja zakończona pomyślnie!"
echo "Teraz możesz uruchomić serwis AI: ./start_ai_service.sh"
echo ""
