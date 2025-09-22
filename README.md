# Aplikacja Dietetyczna - Backend

Backend dla aplikacji dietetycznej stworzony na branchu `backend` w ramach projektu dietetycznego.

## Struktura bazy danych

### Tabela `users`
- `id` - unikalny identyfikator użytkownika (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `email` - adres email użytkownika (TEXT, UNIQUE, NOT NULL)
- `password` - zahashowane hasło (TEXT, NOT NULL)
- `username` - nazwa użytkownika (TEXT, NOT NULL)
- `created_at` - data utworzenia konta (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `weight` - waga użytkownika w kg (REAL)
- `height` - wzrost użytkownika w cm (REAL)
- `age` - wiek użytkownika (INTEGER)
- `bmi` - indeks BMI użytkownika (REAL)
- `weight_goal` - cel wagowy użytkownika (REAL)

### Tabela `meals`
- `id` - unikalny identyfikator posiłku (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `user_id` - identyfikator użytkownika (INTEGER, NOT NULL)
- `name` - nazwa posiłku (TEXT, NOT NULL)
- `description` - opis posiłku (TEXT)
- `calories` - wartość kaloryczna (INTEGER)
- `protein` - zawartość białka (REAL)
- `carbs` - zawartość węglowodanów (REAL)
- `fat` - zawartość tłuszczów (REAL)
- `meal_date` - data posiłku (DATE DEFAULT CURRENT_DATE)
- `meal_type` - typ posiłku: breakfast, lunch, dinner, snack (TEXT)
- `created_at` - data utworzenia wpisu (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## Instalacja

1. Sklonuj repozytorium:
   ```
   git clone <adres-repozytorium>
   ```

2. Przejdź do katalogu projektu:
   ```
   cd Projekt-Dietetyczny
   ```

3. Zainstaluj zależności:
   ```
   npm install
   ```

4. Skonfiguruj zmienne środowiskowe (opcjonalnie):
   - Skopiuj plik `.env` do `.env.local` i dostosuj ustawienia

5. Zainicjalizuj bazę danych:
   ```
   npm run init-db
   ```

## Uruchomienie

### Tryb deweloperski
```
cd Projekt-Dietetyczny
npm run dev
```

### Tryb produkcyjny
```
cd Projekt-Dietetyczny
npm start
```

## Interfejs konsolowy

Po uruchomieniu serwera dostępny jest interfejs konsolowy, który umożliwia monitorowanie i zarządzanie aplikacją. Dostępne komendy:

- `help` - Wyświetla listę dostępnych komend
- `endpoints` lub `routes` - Wyświetla wszystkie dostępne endpointy API
- `status` - Wyświetla status serwera
- `stats` - Wyświetla statystyki API (liczba żądań, metody HTTP, popularne endpointy, kody statusu)
- `users` - Wyświetla listę użytkowników
- `restart` - Restartuje serwer
- `clear` - Czyści konsolę
- `exit` - Zamyka serwer i kończy pracę

## Dostępne endpointy API

### Użytkownicy
- `POST /api/users/register` - rejestracja nowego użytkownika
- `POST /api/users/login` - logowanie użytkownika
- `GET /api/users/profile` - pobranie profilu użytkownika (wymagana autoryzacja)
- `PUT /api/users/profile` - aktualizacja profilu użytkownika (wymagana autoryzacja)
- `PUT /api/users/change-password` - zmiana hasła użytkownika (wymagana autoryzacja)
- `DELETE /api/users/account` - usunięcie konta użytkownika (wymagana autoryzacja)

### Posiłki
- `GET /api/meals` - pobranie listy posiłków użytkownika (wymagana autoryzacja)
  - Parametry: date, startDate, endDate, type, sort, limit, offset
- `GET /api/meals/:id` - pobranie pojedynczego posiłku (wymagana autoryzacja)
- `POST /api/meals` - dodanie nowego posiłku (wymagana autoryzacja)
- `POST /api/meals/with-analysis` - dodanie posiłku z analizą AI (wymagana autoryzacja)
- `PUT /api/meals/:id` - aktualizacja posiłku (wymagana autoryzacja)
- `DELETE /api/meals/:id` - usunięcie posiłku (wymagana autoryzacja)
- `POST /api/meals/analyze` - analiza posiłku przez AI (wymagana autoryzacja)
- `GET /api/meals/summary/daily` - pobranie dziennego podsumowania (wymagana autoryzacja)
  - Parametry: date (domyślnie dzisiejsza data)
- `POST /api/meals/:id/share` - udostępnienie posiłku innemu użytkownikowi (wymagana autoryzacja)

### Raporty
- `GET /api/reports/daily` - pobranie szczegółowego raportu dziennego z sugestiami (wymagana autoryzacja)
  - Parametry: date (domyślnie dzisiejsza data)
- `GET /api/reports/weekly` - pobranie raportu tygodniowego z analizą trendów (wymagana autoryzacja)
  - Parametry: endDate (domyślnie dzisiejsza data)

### System
- `GET /api/system/stats` - pobranie statystyk API
- `POST /api/system/stats/reset` - resetowanie statystyk API

## Funkcje AI

Aplikacja wykorzystuje sztuczną inteligencję do analizy posiłków i obliczania wartości odżywczych:

- **Analiza posiłków** - Automatyczna analiza składników i oszacowanie wartości kalorycznej oraz makroskładników
- **Wykrywanie alergenów** - Identyfikacja potencjalnych alergenów na podstawie składników
- **Sugestie i rekomendacje** - AI generuje sugestie dotyczące poprawy wartości odżywczej posiłków
- **Ocena zdrowotna** - Ocena zbilansowania posiłku i jego wpasowania w dietę

## Technologie
- Node.js
- Express.js
- SQLite3
- JSON Web Tokens (JWT)
- bcrypt
- Sztuczna Inteligencja (symulowana na serwerze)

## Logi
Logi serwera są zapisywane w katalogu `logs/` w postaci plików dziennika z datą w nazwie. Logi zawierają informacje o uruchomieniu serwera, żądaniach HTTP, błędach i innych zdarzeniach systemowych.
