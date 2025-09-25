#!/bin/bash
# Skrypt do uruchomienia serwisu AI

# Sprawdzanie czy istnieją katalogi
mkdir -p uploads/meals

# Wyświetlanie informacji
echo "==================================="
echo "Uruchamianie serwisu AI dla aplikacji dietetycznej"
echo "==================================="
echo ""

# Sprawdzanie czy Python jest zainstalowany
if ! command -v python3 &> /dev/null; then
    echo "[BŁĄD] Python 3 nie jest zainstalowany"
    echo "Zainstaluj Python 3 za pomocą menedżera pakietów swojego systemu"
    exit 1
fi

# Sprawdzanie czy istnieje wirtualne środowisko
if [ ! -d "ai_service/venv" ]; then
    echo "Tworzenie wirtualnego środowiska Python..."
    cd ai_service
    python3 -m venv venv
    cd ..
fi

# Aktywacja wirtualnego środowiska
source ai_service/venv/bin/activate

# Instalacja zależności
echo "Instalacja zależności Python..."
cd ai_service
pip install -r requirements.txt

# Sprawdzanie, czy istnieje plik .env
if [ ! -f ".env" ]; then
    echo "Tworzenie pliku konfiguracyjnego .env..."
    cp .env.example .env
    echo ""
    echo "[UWAGA] Utworzono plik .env. Przed uruchomieniem serwisu edytuj go i dodaj swój klucz API."
    echo ""
fi

# Uruchamianie serwisu
echo ""
echo "Uruchamianie serwisu AI na porcie 8000..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd ..
