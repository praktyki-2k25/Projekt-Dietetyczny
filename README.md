# Aplikacja Dietetyczna z Integracją AI

Backend aplikacji dietetycznej z integracją AI, przygotowany do współpracy z LangChain i modelami językowymi.

## Wymagania

- Node.js (wersja 14+)
- npm lub yarn

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

## Funkcje

- **Zarządzanie użytkownikami** - rejestracja, logowanie, profile
- **Zarządzanie posiłkami** - dodawanie, edycja, usuwanie posiłków
- **Analiza AI** - analiza składu posiłków przez modele językowe
- **Raporty i statystyki** - dzienne i tygodniowe podsumowania diety
- **Udostępnianie** - dzielenie się posiłkami z innymi użytkownikami

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

### Integracja z LangChain

Aby zintegrować z LangChain, zainstaluj dodatkowe pakiety:
```bash
npm install langchain @langchain/openai
```

Następnie zmodyfikuj plik `src/services/ai-service.js` zgodnie z przykładem w komentarzach.

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

## Gotowy użytkownik testowy

Po inicjalizacji bazy danych, dostępne jest konto testowe:
- Email: `test@example.com`
- Hasło: `haslo123`
