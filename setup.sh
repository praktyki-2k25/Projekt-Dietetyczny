#!/bin/bash

echo "🚀 Uruchamianie Aplikacji Dietetycznej"
echo "======================================"

# Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nie jest zainstalowany. Pobierz z https://nodejs.org"
    exit 1
fi

# Sprawdź czy npm jest zainstalowany
if ! command -v npm &> /dev/null; then
    echo "❌ npm nie jest zainstalowany"
    exit 1
fi

echo "✅ Node.js wersja: $(node --version)"
echo "✅ npm wersja: $(npm --version)"
echo

# Backend
echo "🔧 Przygotowywanie backendu..."
if [ ! -f "package.json" ]; then
    echo "❌ Nie znaleziono package.json w katalogu głównym"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalowanie zależności backendu..."
    npm install
fi

# Frontend
echo "🔧 Przygotowywanie frontendu..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ Nie znaleziono package.json w katalogu frontend"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalowanie zależności frontendu..."
    npm install
fi

cd ..

# Inicjalizacja bazy danych
echo "🗄️ Inicjalizowanie bazy danych..."
if [ ! -f "diet_app.db" ]; then
    npm run init-db
    echo "✅ Baza danych została zainicjalizowana"
else
    echo "✅ Baza danych już istnieje"
fi

# Tworzenie pliku .env jeśli nie istnieje
if [ ! -f ".env" ]; then
    echo "⚙️ Tworzenie pliku konfiguracyjnego .env..."
    cat > .env << EOL
# Konfiguracja serwera
PORT=5000
NODE_ENV=development

# JWT Secret (w produkcji użyj bezpiecznego klucza)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Configuration
AI_ENABLED=true

# Opcjonalnie: klucz API Claude (jeśli chcesz użyć własnego)
# CLAUDE_API_KEY=your_claude_api_key_here
EOL
    echo "✅ Plik .env został utworzony"
fi

echo
echo "🎉 Aplikacja jest gotowa do uruchomienia!"
echo
echo "Aby uruchomić aplikację:"
echo "1. Backend:  npm run dev     (w głównym katalogu)"
echo "2. Frontend: npm run dev     (w katalogu frontend/)"
echo
echo "Lub użyj:"
echo "npm run start-all  # Uruchamia backend i frontend jednocześnie"
echo
echo "Aplikacja będzie dostępna pod adresem:"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo
echo "Konto testowe:"
echo "📧 Email: test@example.com"
echo "🔐 Hasło: haslo123"
