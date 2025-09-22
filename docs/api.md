# Dokumentacja API aplikacji dietetycznej

Ten dokument zawiera szczegółowe informacje na temat dostępnych endpointów API, ich parametrów oraz zwracanych danych.

## Uwierzytelnianie

API wykorzystuje tokeny JWT (JSON Web Token) do uwierzytelniania użytkowników. Aby uzyskać dostęp do chronionych endpointów, należy najpierw zalogować się i uzyskać token, a następnie dołączać go do każdego żądania w nagłówku `Authorization`.

### Uzyskiwanie tokenu

```
POST /api/users/login
```

**Wymagane parametry:**
```json
{
  "email": "email@example.com",
  "password": "hasło_użytkownika"
}
```

**Odpowiedź:**
```json
{
  "message": "Zalogowano pomyślnie",
  "user": {
    "id": 1,
    "email": "email@example.com",
    "username": "NazwaUżytkownika",
    "bmi": 24.8
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Używanie tokenu

Dołącz token w nagłówku `Authorization` w formacie `Bearer {token}`:

```
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Użytkownicy

### Rejestracja użytkownika

```
POST /api/users/register
```

**Parametry:**
```json
{
  "email": "email@example.com",
  "password": "hasło_użytkownika",
  "username": "NazwaUżytkownika",
  "weight": 80.5,           // opcjonalne, w kg
  "height": 180,            // opcjonalne, w cm
  "age": 30,                // opcjonalne
  "weight_goal": 75,        // opcjonalne, w kg
  "gender": "male",         // opcjonalne, "male" lub "female"
  "activity_level": "moderate" // opcjonalne, "low", "moderate", "high", "very_high"
}
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Użytkownik został zarejestrowany",
  "user": {
    "id": 1,
    "email": "email@example.com",
    "username": "NazwaUżytkownika",
    "bmi": 24.8
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logowanie użytkownika

```
POST /api/users/login
```

**Parametry:**
```json
{
  "email": "email@example.com",
  "password": "hasło_użytkownika"
}
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Zalogowano pomyślnie",
  "user": {
    "id": 1,
    "email": "email@example.com",
    "username": "NazwaUżytkownika",
    "bmi": 24.8
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Pobieranie profilu użytkownika

```
GET /api/users/profile
```

**Wymagane uwierzytelnienie:** Tak

**Odpowiedź (200 OK):**
```json
{
  "id": 1,
  "email": "email@example.com",
  "username": "NazwaUżytkownika",
  "created_at": "2023-04-15T14:30:45.000Z",
  "weight": 80.5,
  "height": 180,
  "age": 30,
  "bmi": 24.8,
  "weight_goal": 75,
  "gender": "male",
  "activity_level": "moderate"
}
```

### Aktualizacja profilu użytkownika

```
PUT /api/users/profile
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "username": "NowaNazwaUżytkownika", // opcjonalne
  "weight": 78.5,                      // opcjonalne
  "height": 180,                       // opcjonalne
  "age": 31,                           // opcjonalne
  "weight_goal": 72,                   // opcjonalne
  "gender": "male",                    // opcjonalne
  "activity_level": "high"             // opcjonalne
}
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Profil został zaktualizowany",
  "user": {
    "id": 1,
    "email": "email@example.com",
    "username": "NowaNazwaUżytkownika",
    "created_at": "2023-04-15T14:30:45.000Z",
    "weight": 78.5,
    "height": 180,
    "age": 31,
    "bmi": 24.2,
    "weight_goal": 72,
    "gender": "male",
    "activity_level": "high"
  }
}
```

### Zmiana hasła

```
PUT /api/users/change-password
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "current_password": "aktualne_hasło",
  "new_password": "nowe_hasło"
}
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Hasło zostało zmienione"
}
```

### Usunięcie konta

```
DELETE /api/users/account
```

**Wymagane uwierzytelnienie:** Tak

**Odpowiedź (200 OK):**
```json
{
  "message": "Konto zostało usunięte"
}
```

### Wyszukiwanie użytkowników

```
GET /api/users/search?query=jan
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
- `query` - ciąg znaków do wyszukania (min. 3 znaki)

**Odpowiedź (200 OK):**
```json
[
  {
    "id": 2,
    "username": "Janusz",
    "email": "janusz@example.com"
  },
  {
    "id": 5,
    "username": "Jan Kowalski",
    "email": "jan.kowalski@example.com"
  }
]
```

## Posiłki

### Pobieranie listy posiłków

```
GET /api/meals
```

**Wymagane uwierzytelnienie:** Tak

**Parametry (opcjonalne):**
- `date` - data w formacie YYYY-MM-DD, filtruje posiłki z danego dnia
- `startDate` i `endDate` - zakres dat (YYYY-MM-DD), filtruje posiłki z danego okresu
- `type` - typ posiłku (breakfast, lunch, dinner, snack), filtruje posiłki według typu
- `sort` - porządek sortowania (asc, desc), domyślnie desc (od najnowszych)
- `limit` - limit wyników, domyślnie 100
- `offset` - przesunięcie wyników, używane do paginacji, domyślnie 0

**Odpowiedź (200 OK):**
```json
[
  {
    "id": 123,
    "user_id": 1,
    "name": "Jajecznica na maśle",
    "description": "Jajecznica z 3 jaj na maśle z pomidorami i szczypiorkiem",
    "calories": 350,
    "protein": 22,
    "carbs": 5,
    "fat": 28,
    "meal_date": "2023-04-15",
    "meal_type": "breakfast",
    "created_at": "2023-04-15T08:30:45.000Z"
  },
  {
    "id": 124,
    "user_id": 1,
    "name": "Kurczak z ryżem",
    "description": "Grillowana pierś z kurczaka z ryżem i warzywami",
    "calories": 520,
    "protein": 42,
    "carbs": 45,
    "fat": 12,
    "meal_date": "2023-04-15",
    "meal_type": "lunch",
    "created_at": "2023-04-15T14:30:45.000Z"
  }
]
```

### Pobieranie pojedynczego posiłku

```
GET /api/meals/{id}
```

**Wymagane uwierzytelnienie:** Tak

**Odpowiedź (200 OK):**
```json
{
  "id": 123,
  "user_id": 1,
  "name": "Jajecznica na maśle",
  "description": "Jajecznica z 3 jaj na maśle z pomidorami i szczypiorkiem",
  "calories": 350,
  "protein": 22,
  "carbs": 5,
  "fat": 28,
  "meal_date": "2023-04-15",
  "meal_type": "breakfast",
  "created_at": "2023-04-15T08:30:45.000Z"
}
```

### Dodawanie nowego posiłku

```
POST /api/meals
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "name": "Sałatka z tuńczykiem",
  "description": "Sałatka z tuńczykiem, jajkiem i warzywami",
  "calories": 320,
  "protein": 28,
  "carbs": 10,
  "fat": 18,
  "meal_date": "2023-04-15",
  "meal_type": "dinner"
}
```

**Odpowiedź (201 Created):**
```json
{
  "id": 125,
  "user_id": 1,
  "name": "Sałatka z tuńczykiem",
  "description": "Sałatka z tuńczykiem, jajkiem i warzywami",
  "calories": 320,
  "protein": 28,
  "carbs": 10,
  "fat": 18,
  "meal_date": "2023-04-15",
  "meal_type": "dinner",
  "created_at": "2023-04-15T19:30:45.000Z"
}
```

### Dodawanie posiłku z analizą AI

```
POST /api/meals/with-analysis
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "name": "Jajecznica z pomidorami",
  "ingredients": "2 jajka, 1 pomidor, 1 łyżka masła, szczypiorek, sól, pieprz",
  "meal_type": "breakfast",
  "meal_date": "2023-04-16"
}
```

**Odpowiedź (201 Created):**
```json
{
  "meal": {
    "id": 126,
    "user_id": 1,
    "name": "Jajecznica z pomidorami",
    "description": "",
    "calories": 265,
    "protein": 14.8,
    "carbs": 5.5,
    "fat": 21.4,
    "meal_date": "2023-04-16",
    "meal_type": "breakfast",
    "created_at": "2023-04-16T08:30:45.000Z"
  },
  "ai_analysis": {
    "meal_name": "Jajecznica z pomidorami",
    "estimated_values": {
      "calories": 265,
      "protein": 14.8,
      "carbs": 5.5,
      "fat": 21.4
    },
    "allergens": ["jajka", "mleko"],
    "suggestions": [
      "Dobre źródło białka na śniadanie",
      "Możesz dodać więcej warzyw dla zwiększenia wartości odżywczych"
    ],
    "health_score": 8
  }
}
```

### Aktualizacja posiłku

```
PUT /api/meals/{id}
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "name": "Sałatka z tuńczykiem i awokado",
  "description": "Sałatka z tuńczykiem, jajkiem, awokado i warzywami",
  "calories": 380,
  "protein": 30,
  "carbs": 12,
  "fat": 22,
  "meal_date": "2023-04-15",
  "meal_type": "dinner"
}
```

**Odpowiedź (200 OK):**
```json
{
  "id": 125,
  "user_id": 1,
  "name": "Sałatka z tuńczykiem i awokado",
  "description": "Sałatka z tuńczykiem, jajkiem, awokado i warzywami",
  "calories": 380,
  "protein": 30,
  "carbs": 12,
  "fat": 22,
  "meal_date": "2023-04-15",
  "meal_type": "dinner",
  "created_at": "2023-04-15T19:30:45.000Z"
}
```

### Usuwanie posiłku

```
DELETE /api/meals/{id}
```

**Wymagane uwierzytelnienie:** Tak

**Odpowiedź (200 OK):**
```json
{
  "message": "Posiłek został usunięty"
}
```

### Analiza posiłku przez AI

```
POST /api/meals/analyze
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "name": "Jajecznica z pomidorami",
  "ingredients": "2 jajka, 1 pomidor, 1 łyżka masła, szczypiorek, sól, pieprz",
  "meal_type": "breakfast"
}
```

**Odpowiedź (200 OK):**
```json
{
  "meal_name": "Jajecznica z pomidorami",
  "original_values": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "estimated_values": {
    "calories": 265,
    "protein": 14.8,
    "carbs": 5.5,
    "fat": 21.4
  },
  "ingredients_analysis": [
    {
      "name": "jajko",
      "estimated_weight": 100,
      "nutritional_values": {
        "calories": 155,
        "protein": 12.5,
        "carbs": 1.1,
        "fat": 10.8
      }
    },
    {
      "name": "pomidor",
      "estimated_weight": 100,
      "nutritional_values": {
        "calories": 18,
        "protein": 0.9,
        "carbs": 3.9,
        "fat": 0.2
      }
    },
    {
      "name": "masło",
      "estimated_weight": 14,
      "nutritional_values": {
        "calories": 92,
        "protein": 0.1,
        "carbs": 0.0,
        "fat": 10.4
      }
    }
  ],
  "allergens": ["jajka", "mleko"],
  "suggestions": [
    "Dobre źródło białka na śniadanie",
    "Możesz dodać więcej warzyw dla zwiększenia wartości odżywczych",
    "Rozważ użycie oliwy zamiast masła, aby zmniejszyć ilość tłuszczów nasyconych"
  ],
  "health_score": 8,
  "confidence_score": 0.85
}
```

### Pobranie dziennego podsumowania

```
GET /api/meals/summary/daily?date=2023-04-15
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
- `date` - data w formacie YYYY-MM-DD, domyślnie dzisiejsza data

**Odpowiedź (200 OK):**
```json
{
  "total_calories": 1250,
  "total_protein": 92,
  "total_carbs": 60,
  "total_fat": 58,
  "meals_count": 3,
  "date": "2023-04-15",
  "meals_by_type": {
    "breakfast": [
      {
        "id": 123,
        "name": "Jajecznica na maśle",
        "calories": 350,
        "protein": 22,
        "carbs": 5,
        "fat": 28,
        "meal_type": "breakfast",
        "meal_date": "2023-04-15"
      }
    ],
    "lunch": [
      {
        "id": 124,
        "name": "Kurczak z ryżem",
        "calories": 520,
        "protein": 42,
        "carbs": 45,
        "fat": 12,
        "meal_type": "lunch",
        "meal_date": "2023-04-15"
      }
    ],
    "dinner": [
      {
        "id": 125,
        "name": "Sałatka z tuńczykiem i awokado",
        "calories": 380,
        "protein": 30,
        "carbs": 12,
        "fat": 22,
        "meal_type": "dinner",
        "meal_date": "2023-04-15"
      }
    ],
    "snack": [],
    "other": []
  },
  "daily_goals": {
    "calories": 2000,
    "protein": 75,
    "carbs": 250,
    "fat": 67
  },
  "percent_of_daily": {
    "calories": 63,
    "protein": 123,
    "carbs": 24,
    "fat": 87
  }
}
```

### Udostępnianie posiłku innemu użytkownikowi

```
POST /api/meals/{id}/share
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
```json
{
  "email": "znajomy@example.com",
  "message": "Świetny przepis na śniadanie, musisz spróbować!"
}
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Posiłek został udostępniony",
  "shared_meal_id": 127
}
```

## Raporty

### Raport dzienny

```
GET /api/reports/daily?date=2023-04-15
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
- `date` - data w formacie YYYY-MM-DD, domyślnie dzisiejsza data

**Odpowiedź (200 OK):**
```json
{
  "user": {
    "username": "NazwaUżytkownika",
    "weight": 80.5,
    "height": 180,
    "age": 30,
    "bmi": 24.8,
    "weight_goal": 75
  },
  "total_calories": 1250,
  "total_protein": 92,
  "total_carbs": 60,
  "total_fat": 58,
  "meals_count": 3,
  "date": "2023-04-15",
  "meals_by_type": {
    "breakfast": [
      {
        "id": 123,
        "name": "Jajecznica na maśle",
        "calories": 350,
        "protein": 22,
        "carbs": 5,
        "fat": 28,
        "meal_type": "breakfast"
      }
    ],
    "lunch": [
      {
        "id": 124,
        "name": "Kurczak z ryżem",
        "calories": 520,
        "protein": 42,
        "carbs": 45,
        "fat": 12,
        "meal_type": "lunch"
      }
    ],
    "dinner": [
      {
        "id": 125,
        "name": "Sałatka z tuńczykiem i awokado",
        "calories": 380,
        "protein": 30,
        "carbs": 12,
        "fat": 22,
        "meal_type": "dinner"
      }
    ],
    "snack": [],
    "other": []
  },
  "daily_goals": {
    "calories": 2200,
    "protein": 110,
    "carbs": 275,
    "fat": 73
  },
  "percent_of_daily": {
    "calories": 57,
    "protein": 84,
    "carbs": 22,
    "fat": 79
  },
  "suggestions": [
    "Twoja dieta zawiera mało węglowodanów. Węglowodany są głównym źródłem energii dla organizmu.",
    "Jadasz mało posiłków w ciągu dnia. Spróbuj jeść 3-5 mniejszych posiłków zamiast 1-2 dużych."
  ]
}
```

### Raport tygodniowy

```
GET /api/reports/weekly?endDate=2023-04-15
```

**Wymagane uwierzytelnienie:** Tak

**Parametry:**
- `endDate` - data końcowa w formacie YYYY-MM-DD, domyślnie dzisiejsza data. Raport obejmuje 7 dni wstecz od tej daty.

**Odpowiedź (200 OK):**
```json
{
  "user": {
    "username": "NazwaUżytkownika",
    "weight": 80.5,
    "height": 180,
    "age": 30,
    "bmi": 24.8,
    "weight_goal": 75
  },
  "start_date": "2023-04-09",
  "end_date": "2023-04-15",
  "total_meals": 18,
  "days": {
    "2023-04-09": {
      "date": "2023-04-09",
      "meals_count": 2,
      "calories": 950,
      "protein": 65,
      "carbs": 85,
      "fat": 35,
      "meals": [...]
    },
    "2023-04-10": {
      "date": "2023-04-10",
      "meals_count": 3,
      "calories": 1350,
      "protein": 88,
      "carbs": 120,
      "fat": 60,
      "meals": [...]
    },
    // Pozostałe dni...
    "2023-04-15": {
      "date": "2023-04-15",
      "meals_count": 3,
      "calories": 1250,
      "protein": 92,
      "carbs": 60,
      "fat": 58,
      "meals": [...]
    }
  },
  "summary": {
    "calories": {
      "total": 8750,
      "avg": 1250,
      "min": 950,
      "max": 1600
    },
    "protein": {
      "total": 595,
      "avg": 85.0,
      "min": 65,
      "max": 95
    },
    "carbs": {
      "total": 665,
      "avg": 95.0,
      "min": 60,
      "max": 130
    },
    "fat": {
      "total": 360,
      "avg": 51.4,
      "min": 35,
      "max": 65
    }
  },
  "meal_types_frequency": {
    "breakfast": 7,
    "lunch": 6,
    "dinner": 4,
    "snack": 1,
    "other": 0
  },
  "trends": {
    "calorie_trend": "stable",
    "protein_trend": "stable",
    "carbs_trend": "inconsistent",
    "fat_trend": "stable",
    "meal_consistency": "good"
  },
  "suggestions": [
    "Twoje spożycie węglowodanów jest bardzo zróżnicowane w ciągu tygodnia. Spróbuj utrzymać bardziej regularne nawyki żywieniowe.",
    "Twoja dieta zawiera dużo białka. Upewnij się, że pijesz wystarczająco dużo wody."
  ]
}
```

## Kody błędów

API może zwracać następujące kody błędów:

- **400 Bad Request** - nieprawidłowe zapytanie, brakujące parametry
- **401 Unauthorized** - brak tokenu uwierzytelniającego
- **403 Forbidden** - nieprawidłowy token uwierzytelniający
- **404 Not Found** - zasób nie został znaleziony
- **409 Conflict** - konflikt (np. użytkownik z takim adresem email już istnieje)
- **500 Internal Server Error** - wewnętrzny błąd serwera

## Wskazówki

### Paginacja

Dla endpointów, które mogą zwracać dużo danych (np. lista posiłków), zaleca się używanie parametrów `limit` i `offset` do paginacji wyników:

```
GET /api/meals?limit=10&offset=0  // pierwsze 10 wyników
GET /api/meals?limit=10&offset=10 // kolejne 10 wyników
```

### Filtrowanie

Endpointy obsługujące filtrowanie (np. lista posiłków) pozwalają na zawężenie wyników według różnych kryteriów:

```
GET /api/meals?date=2023-04-15&type=breakfast  // śniadania z konkretnego dnia
GET /api/meals?startDate=2023-04-01&endDate=2023-04-30  // posiłki z całego miesiąca
```

### Sortowanie

Endpointy obsługujące sortowanie (np. lista posiłków) pozwalają na określenie porządku wyników:

```
GET /api/meals?sort=asc  // od najstarszych do najnowszych
GET /api/meals?sort=desc // od najnowszych do najstarszych (domyślnie)
```
