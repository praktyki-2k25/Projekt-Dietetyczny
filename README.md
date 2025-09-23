# Aplikacja Dietetyczna z Integracją AI

**Kompletna aplikacja dietetyczna** z backendem Node.js, frontendem React i integracją z Claude AI do analizy składu żywieniowego posiłków.

## 🌟 Funkcje

### ✅ Zaimplementowane
- **📝 Zarządzanie użytkownikami** - rejestracja, logowanie, profile z danymi biometrycznymi
- **🍽️ Zarządzanie posiłkami** - dodawanie, przeglądanie posiłków z dokładnymi wartościami odżywczymi
- **🤖 Analiza AI** - automatyczne obliczanie wartości odżywczych na podstawie składników
- **📊 Dashboard i statystyki** - interaktywne wykresy spożycia makronutrientów
- **📱 Responsive design** - pełne wsparcie urządzeń mobilnych
- **🔒 Bezpieczeństwo** - uwierzytelnianie JWT, hashowanie haseł

### 🔜 Planowane funkcje
- Raporty tygodniowe i miesięczne
- Udostępnianie posiłków między użytkownikami
- Eksport danych do PDF/Excel
- Powiadomienia o celach żywieniowych
- Integracja z urządzeniami fitness

## 🏗️ Architektura

### Backend (Node.js + Express)
- **API RESTful** z kompletną dokumentacją
- **Baza danych SQLite** z migracjami
- **Integracja Claude AI** do analizy składników
- **Middleware uwierzytelniania** JWT
- **Walidacja danych** i obsługa błędów

### Frontend (React + TypeScript)
- **Nowoczesny stack** - Vite, Tailwind CSS, React Query
- **Komponenty UI** - w pełni typowane i reusealne
- **State management** - React Context + React Query
- **Wykresy interaktywne** - Recharts
- **Formularze zaawansowane** - React Hook Form

## 🚀 Szybki start

### 1. Automatyczna instalacja (Windows)
```cmd
# Uruchom plik setup
setup.bat
```

### 2. Automatyczna instalacja (Linux/Mac)
```bash
# Nadaj uprawnienia i uruchom
chmod +x setup.sh
./setup.sh
```

### 3. Ręczna instalacja

**Backend:**
```bash
# Zainstaluj zależności
npm install

# Zainicjalizuj bazę danych
npm run init-db

# Uruchom serwer deweloperski
npm run dev
```

**Frontend:**
```bash
# Przejdź do katalogu frontend
cd frontend

# Zainstaluj zależności
npm install

# Uruchom aplikację
npm run dev
```

### 4. Uruchamianie całej aplikacji
```bash
# Backend i frontend jednocześnie
npm run start-all
```

## 🌐 Dostęp do aplikacji

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api (szczegóły w docs/api.md)

### 🧪 Konto testowe
- **Email**: test@example.com
- **Hasło**: haslo123

## 📋 Wymagania systemowe

- **Node.js** wersja 16+ (zalecana najnowsza LTS)
- **npm** wersja 8+ (instaluje się z Node.js)
- **System operacyjny**: Windows 10+, macOS 10.15+, Linux Ubuntu 18.04+
- **Pamięć RAM**: minimum 4GB (zalecane 8GB+)
- **Miejsce na dysku**: ~500MB dla całego projektu

## 🛠️ Konfiguracja

### Zmienne środowiskowe (.env)
```env
# Konfiguracja serwera
PORT=5000
NODE_ENV=development

# JWT Secret (zmień w produkcji!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Funkcje AI
AI_ENABLED=true

# Opcjonalnie: własny klucz Claude API
CLAUDE_API_KEY=your_claude_api_key_here
```

### Konfiguracja AI
Aplikacja może działać w dwóch trybach:
1. **Tryb demonstracyjny** (domyślny) - symulowane odpowiedzi AI
2. **Tryb produkcyjny** - prawdziwa integracja z Claude API

Aby włączyć prawdziwą integrację, dodaj swój klucz API w pliku `.env`.

## Instalacja

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skonfiguruj zmienne środowiskowe w pliku `.env`
4. Zainicjalizuj bazę danych:
   ```bash
   npm run init-db
   ```
5. Uruchom serwer:
   ```bash
   npm run dev
   ```

## 📚 Struktura projektu

```
Projekt-Dietetyczny/
├── backend/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── database/           # Konfiguracja bazy danych
│   │   ├── middleware/         # Middleware (uwierzytelnianie)
│   │   ├── models/             # Modele danych (User, Meal)
│   │   ├── routes/             # Endpointy API
│   │   ├── services/           # Usługi (AI, zewnętrzne API)
│   │   └── utils/              # Narzędzia pomocnicze
│   ├── docs/                   # Dokumentacja API
│   ├── server.js               # Główny plik serwera
│   ├── package.json
│   └── .env                    # Konfiguracja (twórz ręcznie)
├── frontend/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/         # Komponenty React
│   │   ├── contexts/           # Konteksty (AuthContext)
│   │   ├── lib/                # API client, utilities
│   │   ├── pages/              # Strony aplikacji
│   │   ├── types/              # Typy TypeScript
│   │   └── App.tsx             # Główny komponent
│   ├── public/                 # Pliki statyczne
│   ├── package.json
│   └── vite.config.ts          # Konfiguracja Vite
├── diet_app.db               # Baza danych SQLite (tworzy się automatycznie)
├── setup.bat                 # Skrypt instalacyjny Windows
├── setup.sh                  # Skrypt instalacyjny Linux/Mac
└── README.md                 # Ta dokumentacja
```

## 💻 Dostępne skrypty

### Backend (główny katalog)
```bash
npm run dev              # Uruchom backend w trybie deweloperskim
npm run start            # Uruchom backend w trybie produkcyjnym
npm run init-db          # Zainicjalizuj bazę danych
npm run test-ai          # Przetestuj integrację AI
npm run start-all        # Uruchom backend i frontend jednocześnie
npm run setup            # Pełna instalacja projektu
```

### Frontend (katalog frontend/)
```bash
npm run dev              # Uruchom frontend w trybie deweloperskim
npm run build            # Zbuduj wersję produkcyjną
npm run preview          # Podejrzyj wersję produkcyjną
```

## Integracja z AI

### Włączanie funkcji AI

W pliku `.env` ustaw:
```
AI_ENABLED=true
```

Dodatkowo, aby podłączyć zewnętrzny model językowy, ustaw:
```
AI_SERVICE_URL=http://localhost:8000  # Dla własnego serwisu AI
```

Lub dla OpenAI:
```
OPENAI_API_KEY=your_openai_key_here
```

### Punkty integracji AI

1. **Analiza posiłków** - `src/services/ai-service.js` zawiera funkcję `getAiAnalysis()`
2. **Rekomendacje dietetyczne** - funkcja `getDietRecommendations()`
3. **Zarządzanie promptami** - system przechowujący szablony zapytań do modeli AI

## 🤖 Przewodnik po funkcjach AI

### Jak działa analiza AI?
1. **Podaj składniki**: np. "2 jajka, 1 pomidor, 1 łyżka masła"
2. **AI analizuje**: Rozpoznaje składniki i szacuje ilości
3. **Oblicza wartości**: Kalorie, białko, węglowodany, tłuszcze
4. **Dodaje sugestie**: Rekomendacje żywieniowe i informacje o alergenach

### Przykłady analizy
- "Jajecznica z 3 jaj, pomidor, szczypiorek" → ~280 kcal
- "Kanapka: 2 kromki chleba, 50g szynki, masło" → ~320 kcal
- "Owsianka z bananem i miodem" → ~250 kcal

## 🛡️ Rozwiązywanie problemów

### Backend nie uruchamia się
```bash
# Sprawdź czy port 5000 jest wolny
netstat -an | findstr :5000

# Uruchom ponownie z debug
DEBUG=* npm run dev
```

### Frontend nie łączy się z API
1. Sprawdź czy backend działa na porcie 5000
2. Sprawdź konfigrację proxy w `frontend/vite.config.ts`
3. Sprawdź Network tab w DevTools przegladarki

### Błędy bazy danych
```bash
# Usuń i zainicjalizuj ponownie
rm diet_app.db
npm run init-db
```

### Błędy instalacji
```bash
# Wyczyść cache npm
npm cache clean --force

# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

## Struktura projektu

```
Projekt-Dietetyczny/
├── server.js             # Główny plik serwera
├── .env                  # Zmienne środowiskowe
├── src/
│   ├── database/         # Obsługa bazy danych
│   ├── middleware/       # Middleware (auth.js)
│   ├── models/           # Modele danych
│   ├── routes/           # Trasy API
│   └── services/         # Serwisy (ai-service.js)
```

## Endpointy API

### Użytkownicy

- POST `/api/users/register` - rejestracja
- POST `/api/users/login` - logowanie
- GET `/api/users/profile` - profil użytkownika
- PUT `/api/users/profile` - aktualizacja profilu

### Posiłki

- GET `/api/meals` - pobranie wszystkich posiłków
- GET `/api/meals/:id` - pobranie posiłku
- POST `/api/meals` - dodanie posiłku
- PUT `/api/meals/:id` - aktualizacja posiłku
- DELETE `/api/meals/:id` - usunięcie posiłku
- GET `/api/meals/summary/daily` - podsumowanie dzienne
- POST `/api/meals/:id/share` - udostępnianie posiłku

### AI

- POST `/api/ai/analyze-meal` - analiza posiłku
- GET `/api/ai/diet-recommendations` - rekomendacje dietetyczne
- GET `/api/ai/prompts` - dostępne prompty
- POST `/api/ai/prompts` - dodawanie promptu
- PUT `/api/ai/prompts/:id` - aktualizacja promptu
- POST `/api/ai/test-prompt` - testowanie promptu

## 📈 Plan rozwoju

### Faza 1 ✅ (Ukończona)
- [x] Backend API z uwierzytelnianiem JWT
- [x] Frontend React z TypeScript
- [x] Integracja Claude AI
- [x] Dashboard ze statystykami
- [x] Dodawanie posiłków z analizą AI

### Faza 2 🔄 (W trakcie)
- [ ] Lista wszystkich posiłków z filtrowaniem
- [ ] Edycja i usuwanie posiłków
- [ ] Szczegółowa strona profilu użytkownika
- [ ] Eksport raportów do PDF

### Faza 3 🔜 (Zaplanowane)
- [ ] Udostępnianie posiłków między użytkownikami
- [ ] Powiadomienia push o celach
- [ ] Integracja z urządzeniami fitness
- [ ] Aplikacja mobilna (React Native)
- [ ] Tryb offline (PWA)

## 🤝 Wkład w rozwój

Chcesz pomóc w rozwoju projektu?

1. **Zgłaszanie błędów** - używaj GitHub Issues
2. **Nowe funkcje** - utwórz Pull Request
3. **Dokumentacja** - pomóż ulepszyć README i docs
4. **Testy** - dodaj testy jednostkowe i integracyjne

## 📝 Licencja

Projekt jest dostępny na licencji MIT. Zobacz plik LICENSE dla szczegółów.

## 🎯 Autorzy

Aplikacja Dietetyczna z AI - kompleksowe rozwiązanie do śledzenia diety z wykorzystaniem sztucznej inteligencji.

---

**✨ Miłego korzystania z aplikacji! ✨**

Jeśli masz pytania lub napotkasz problemy, sprawdź sekcję [Rozwiązywanie problemów](#🛡️-rozwiązywanie-problemów) lub skontaktuj się z nami.
