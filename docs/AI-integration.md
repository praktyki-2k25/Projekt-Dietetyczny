# Integracja AI w aplikacji dietetycznej

Ten dokument opisuje, jak działa integracja sztucznej inteligencji w aplikacji dietetycznej, jej możliwości oraz sposób implementacji.

## Funkcje AI

### 1. Analiza wartości odżywczych posiłków

AI analizuje składniki posiłku i szacuje ich wartość odżywczą:
- **Kalorie** - całkowita wartość energetyczna posiłku
- **Białko** - zawartość białka w gramach
- **Węglowodany** - zawartość węglowodanów w gramach
- **Tłuszcze** - zawartość tłuszczów w gramach

### 2. Wykrywanie alergenów

AI identyfikuje potencjalne alergeny w składnikach posiłku, takie jak:
- Gluten
- Mleko i produkty mleczne
- Jajka
- Orzechy
- Ryby
- Skorupiaki
- Soja

### 3. Sugestie zdrowotne

AI generuje sugestie dotyczące poprawy wartości odżywczej posiłku, na przykład:
- Propozycje zdrowszych alternatyw dla składników
- Wskazówki dotyczące zbilansowania makroskładników
- Rekomendacje dotyczące zwiększenia lub zmniejszenia ilości określonych składników

### 4. Ocena zdrowotna posiłku

AI ocenia ogólną wartość zdrowotną posiłku w skali 1-10, biorąc pod uwagę:
- Zbilansowanie makroskładników
- Kaloryczność w stosunku do pory dnia
- Obecność wartościowych składników odżywczych

## Implementacja

Obecnie integracja AI jest symulowana na serwerze, ale w produkcyjnej wersji aplikacji można wykorzystać jedno z poniższych rozwiązań:

1. **OpenAI API (GPT-4)** - wysyłanie zapytań do modelu GPT-4 z opisem posiłku i oczekiwaną strukturą odpowiedzi
2. **Dedykowane API analizy żywności** - wykorzystanie specjalistycznego API do analizy wartości odżywczych
3. **Własny model AI** - wytrenowanie własnego modelu do analizy posiłków

## Przykładowe zapytanie API

```json
POST /api/meals/analyze
{
  "name": "Jajecznica z pomidorami",
  "ingredients": "2 jajka, 1 pomidor, 1 łyżka masła, szczypiorek, sól, pieprz",
  "meal_type": "breakfast"
}
```

## Przykładowa odpowiedź API

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
  "allergens": [
    "jajka",
    "mleko"
  ],
  "suggestions": [
    "Dobre źródło białka na śniadanie",
    "Możesz dodać więcej warzyw dla zwiększenia wartości odżywczych",
    "Rozważ użycie oliwy zamiast masła, aby zmniejszyć ilość tłuszczów nasyconych"
  ],
  "health_score": 8,
  "confidence_score": 0.85
}
```

## Rozszerzenia w przyszłości

Planowane rozszerzenia integracji AI:
- **Analiza obrazów posiłków** - użytkownicy będą mogli przesyłać zdjęcia posiłków do analizy
- **Personalizowane rekomendacje** - dostosowanie sugestii do indywidualnych celów i preferencji użytkownika
- **Generowanie planów posiłków** - automatyczne tworzenie planów żywieniowych w oparciu o cele użytkownika
- **Rozpoznawanie mowy** - możliwość dyktowania składników posiłku
