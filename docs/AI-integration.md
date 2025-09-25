# Integracja AI w Projekcie Dietetycznym

Dokumentacja techniczna dotycząca integracji sztucznej inteligencji w aplikacji dietetycznej.

## Spis treści

1. [Przegląd](#przegląd)
2. [Architektura](#architektura)
3. [Serwis AI](#serwis-ai)
4. [Endpointy API](#endpointy-api)
5. [Funkcjonalności AI](#funkcjonalności-ai)
6. [Konfiguracja](#konfiguracja)
7. [Obsługa błędów i fallbacki](#obsługa-błędów-i-fallbacki)
8. [Rozszerzanie funkcjonalności](#rozszerzanie-funkcjonalności)

## Przegląd

Integracja AI w aplikacji dietetycznej umożliwia:

- Automatyczną analizę posiłków na podstawie nazwy i opisu
- Analizę zdjęć posiłków (rozpoznawanie składników i wartości odżywczych)
- Personalizowane rekomendacje dietetyczne na podstawie historii posiłków
- Inteligentne przypomnienia i sugestie
- Propozycje alternatywnych produktów

## Architektura

Integracja AI składa się z dwóch głównych komponentów:

1. **Backend Node.js** - Zawiera endpointy API i logikę komunikacji z serwisem AI
2. **Serwis AI (Python)** - Mikroserwis odpowiedzialny za analizę danych przy użyciu modeli językowych

```
+----------------+        +----------------+        +----------------+
|                |        |                |        |                |
|    Frontend    | <----> |    Backend     | <----> |   Serwis AI    |
|    (React)     |        |    (Node.js)   |        |    (Python)    |
|                |        |                |        |                |
+----------------+        +----------------+        +----------------+
```

## Serwis AI

Serwis AI to aplikacja FastAPI w Pythonie, która używa modeli językowych (LangChain + OpenAI) do analizy danych:

### Uruchomienie serwisu AI

#### Windows:
```bash
start_ai_service.bat
```

#### Linux/Mac:
```bash
chmod +x start_ai_service.sh
./start_ai_service.sh
```

### Endpointy serwisu AI

- `GET /` - Sprawdzenie czy serwis działa
- `POST /analyze-meal` - Analiza posiłku na podstawie nazwy i opisu
- `POST /analyze-meal-photo` - Analiza zdjęcia posiłku
- `POST /recommendations` - Generowanie rekomendacji dietetycznych

## Endpointy API

Backend Node.js udostępnia następujące endpointy związane z AI:

- `POST /api/ai/analyze-meal` - Analiza posiłku bez zapisywania
- `POST /api/ai/analyze-meal-photo` - Analiza zdjęcia posiłku
- `POST /api/ai/save-meal-from-photo` - Zapisanie posiłku ze zdjęcia
- `GET /api/ai/diet-recommendations` - Rekomendacje dietetyczne
- `GET /api/ai/smart-reminders` - Inteligentne przypomnienia
- `POST /api/ai/alternative-products` - Sugestie alternatywnych produktów

Dodatkowo dostępne są endpointy do zarządzania promptami:

- `GET /api/ai/prompts` - Lista promptów
- `GET /api/ai/prompts/:name` - Pobieranie promptu
- `POST /api/ai/prompts` - Dodawanie promptu
- `PUT /api/ai/prompts/:id` - Aktualizacja promptu
- `DELETE /api/ai/prompts/:id` - Usuwanie promptu
- `POST /api/ai/test-prompt` - Testowanie promptu

## Funkcjonalności AI

### 1. Analiza posiłków

Analiza posiłku na podstawie nazwy i opisu:

```javascript
// Przykład zapytania
fetch('/api/ai/analyze-meal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TOKEN'
  },
  body: JSON.stringify({
    name: 'Jajecznica z 3 jaj i bekonem',
    description: 'Z dodatkiem pomidorów i szczypiorku'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

Odpowiedź:
```json
{
  "analysis": {
    "estimated_values": {
      "calories": 420,
      "protein": 28,
      "carbs": 7,
      "fat": 32
    },
    "health_analysis": "Jajecznica z 3 jaj i bekonem to wysokobiałkowy posiłek z dużą zawartością tłuszczu i niską zawartością węglowodanów.",
    "suggestions": [
      "Dodaj więcej warzyw dla zwiększenia ilości błonnika i witamin",
      "Możesz zmniejszyć zawartość tłuszczu, używając mniej bekonu",
      "Dobrze komponuje się z pełnoziarnistym pieczywem jako źródło węglowodanów"
    ]
  }
}
```

### 2. Analiza zdjęć posiłków

Analiza zdjęcia posiłku:

```javascript
// Przykład zapytania
const formData = new FormData();
formData.append('image', file); // file to obiekt File z inputa typu file

fetch('/api/ai/analyze-meal-photo', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

Odpowiedź:
```json
{
  "analysis": {
    "meal_name": "Sałatka z grillowanym kurczakiem",
    "ingredients": [
      "grillowana pierś z kurczaka",
      "sałata",
      "pomidor",
      "ogórek",
      "oliwa z oliwek",
      "przyprawy"
    ],
    "estimated_values": {
      "calories": 320,
      "protein": 35,
      "carbs": 15,
      "fat": 12
    },
    "health_analysis": "To lekki, wysokobiałkowy posiłek bogaty w witaminy i minerały z warzyw.",
    "suggestions": [
      "Dodaj awokado lub orzechy dla zdrowych tłuszczów",
      "Możesz dodać komosę ryżową lub brązowy ryż dla zwiększenia ilości węglowodanów złożonych",
      "Świetny wybór na lunch lub kolację - bogaty w białko i niskokaloryczny"
    ]
  },
  "image_url": "/uploads/meals/1643562789123.jpg"
}
```

### 3. Zapisywanie posiłku ze zdjęcia

```javascript
// Przykład zapytania
const formData = new FormData();
formData.append('image', file);
formData.append('meal_type', 'lunch');

fetch('/api/ai/save-meal-from-photo', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### 4. Rekomendacje dietetyczne

```javascript
// Przykład zapytania
fetch('/api/ai/diet-recommendations', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

Odpowiedź:
```json
{
  "recommendations": [
    "Zwiększ spożycie białka w swojej diecie",
    "Staraj się jeść regularne śniadania - to ważny posiłek na początek dnia",
    "Pij więcej wody - minimum 2 litry dziennie",
    "Ogranicz spożycie prostych cukrów i przetworzonych produktów"
  ],
  "meal_suggestions": [
    "Owsianka z owocami i orzechami na śniadanie",
    "Sałatka z grillowanym kurczakiem, awokado i komosą ryżową na lunch",
    "Pieczona pierś z indyka z batatami i pieczonymi warzywami na obiad"
  ]
}
```

### 5. Inteligentne przypomnienia

```javascript
// Przykład zapytania
fetch('/api/ai/smart-reminders', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

Odpowiedź:
```json
{
  "reminders": [
    {
      "type": "protein",
      "message": "Twoje spożycie białka jest niskie od 2 dni. Rozważ dodanie więcej mięsa, ryb lub roślinnych źródeł białka.",
      "priority": "high"
    },
    {
      "type": "water",
      "message": "Pamiętaj o regularnym piciu wody - minimum 2 litry dziennie!",
      "priority": "medium"
    },
    {
      "type": "vegetables",
      "message": "Dodaj więcej warzyw do swojej diety dla lepszego bilansu mikroelementów.",
      "priority": "medium"
    }
  ]
}
```

### 6. Alternatywne produkty

```javascript
// Przykład zapytania
fetch('/api/ai/alternative-products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TOKEN'
  },
  body: JSON.stringify({
    product_name: 'kurczak',
    meal_context: 'obiad z warzywami'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

Odpowiedź:
```json
{
  "product": "kurczak",
  "alternatives": [
    {
      "name": "Tofu",
      "benefits": "Roślinne źródło białka, niższa zawartość tłuszczu",
      "calories_diff": -30
    },
    {
      "name": "Tempeh",
      "benefits": "Fermentowane białko roślinne, dobre źródło probiotyków",
      "calories_diff": -20
    },
    {
      "name": "Seitan",
      "benefits": "Wysokobiałkowy produkt z glutenu pszennego",
      "calories_diff": -15
    }
  ]
}
```

## Konfiguracja

### Zmienne środowiskowe

Backend (`.env`):
```
# Konfiguracja AI
AI_ENABLED=true
AI_SERVICE_URL=http://localhost:8000
```

Serwis AI (`.env`):
```
# Klucz API dla modelu językowego
OPENAI_API_KEY=your_openai_api_key_here
# lub
CLAUDE_API_KEY=your_claude_api_key_here

# Konfiguracja serwera
AI_SERVICE_PORT=8000
```

## Obsługa błędów i fallbacki

System AI został zaprojektowany z mechanizmami fallback, które zapewniają działanie aplikacji nawet w przypadku problemów z serwisem AI:

1. **Błędy połączenia** - Jeśli serwis AI nie jest dostępny, backend automatycznie przełączy się na generowanie mockowych danych
2. **Brak klucza API** - Jeśli klucz API nie jest dostępny, serwis AI także wygeneruje mockowe dane
3. **Błędy analizy** - W przypadku problemów z analizą danych, system zwróci sensowne mockowe wyniki

Schemat obsługi błędów:

```
try {
    // Próba wykorzystania serwisu AI
    const result = await callAIService();
    return result;
} catch (error) {
    console.error('Błąd AI:', error);
    // Fallback na mockowe dane
    return getMockData();
}
```

## Rozszerzanie funkcjonalności

### Dodawanie nowych modeli

Aby dodać nowy model językowy do serwisu AI:

1. Dodaj nową inicjalizację modelu w `ai_service/main.py`:
```python
new_model = ChatOpenAI(
    temperature=0.7,
    model_name="new-model-name",
)
```

2. Utwórz nowy endpoint lub zmodyfikuj istniejący:
```python
@app.post("/new-endpoint")
async def new_function():
    # Implementacja
    return result
```

3. Dodaj nową funkcję w `src/services/ai-service.js`:
```javascript
async function newAIFunction() {
    // Implementacja
}
```

4. Utwórz nowy endpoint API w `src/routes/ai.js`:
```javascript
router.post('/new-endpoint', authenticateToken, async (req, res) => {
    // Implementacja
});
```

### Tworzenie własnych promptów

Aplikacja umożliwia tworzenie i zarządzanie własnymi promptami dla modeli AI. Aby dodać nowy prompt:

1. Użyj endpointu `/api/ai/prompts`:
```javascript
fetch('/api/ai/prompts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TOKEN'
  },
  body: JSON.stringify({
    name: 'meal_alternatives',
    prompt_text: 'Wygeneruj alternatywy dla posiłku: {meal_name}...',
    description: 'Prompt do generowania alternatyw posiłków'
  })
})
```

2. Następnie możesz używać promptu przez jego nazwę:
```javascript
fetch('/api/ai/test-prompt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TOKEN'
  },
  body: JSON.stringify({
    prompt_name: 'meal_alternatives',
    variables: {
      meal_name: 'Jajecznica z bekonem'
    }
  })
})
```
