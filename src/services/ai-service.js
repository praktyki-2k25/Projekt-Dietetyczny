// Serwis AI do analizy posiłków i składników odżywczych
// W rzeczywistej aplikacji tutaj będzie integracja z OpenAI lub innym serwisem AI

class AIService {
  constructor() {
    // Konfiguracja API AI
    this.config = {
      mockDelay: 1000, // Symulacja opóźnienia API (w ms)
      mockMode: true // Tryb symulacji (bez rzeczywistych zapytań API)
    };

    // Baza popularnych składników i ich wartości odżywczych
    this.ingredientsDatabase = {
      'jajko': { calories: 155, protein: 12.5, carbs: 1.1, fat: 10.8, allergens: ['jajka'] },
      'mleko': { calories: 42, protein: 3.4, carbs: 5.0, fat: 1.0, allergens: ['mleko'] },
      'kurczak': { calories: 165, protein: 31, carbs: 0, fat: 3.6, allergens: [] },
      'ryż': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, allergens: [] },
      'makaron': { calories: 158, protein: 5.8, carbs: 31, fat: 0.9, allergens: ['gluten'] },
      'chleb': { calories: 265, protein: 9.4, carbs: 49, fat: 3.2, allergens: ['gluten'] },
      'masło': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, allergens: ['mleko'] },
      'oliwa': { calories: 884, protein: 0, carbs: 0, fat: 100, allergens: [] },
      'tuńczyk': { calories: 132, protein: 28, carbs: 0, fat: 1.0, allergens: ['ryby'] },
      'łosoś': { calories: 206, protein: 22, carbs: 0, fat: 13, allergens: ['ryby'] },
      'jabłko': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, allergens: [] },
      'banan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, allergens: [] },
      'marchew': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, allergens: [] },
      'brokuł': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, allergens: [] },
      'ziemniak': { calories: 77, protein: 2, carbs: 17, fat: 0.1, allergens: [] },
      'orzechy': { calories: 607, protein: 21, carbs: 20, fat: 54, allergens: ['orzechy'] },
      'czekolada': { calories: 546, protein: 4.9, carbs: 61, fat: 31, allergens: ['mleko'] },
      'jogurt': { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, allergens: ['mleko'] },
      'ser': { calories: 402, protein: 25, carbs: 1.3, fat: 33, allergens: ['mleko'] },
      'pomidor': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, allergens: [] }
    };
  }

  // Metoda do analizy posiłku
  async analyzeMeal(mealData) {
    if (this.config.mockMode) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this._mockAnalyzeMeal(mealData)), this.config.mockDelay);
      });
    } else {
      // Tutaj byłoby prawdziwe wywołanie API AI
      throw new Error('Prawdziwa integracja z API AI nie jest jeszcze zaimplementowana');
    }
  }

  // Metoda do symulacji analizy posiłku
  _mockAnalyzeMeal(mealData) {
    try {
      // Parsowanie składników
      const ingredients = this._parseIngredients(mealData.ingredients || mealData.description || '');
      
      // Analiza wartości odżywczych
      const nutritionalValues = this._calculateNutritionalValues(ingredients);
      
      // Porównanie z wartościami podanymi przez użytkownika
      const comparisonResult = this._compareUserValues(nutritionalValues, mealData);
      
      // Wykrywanie alergenów
      const allergens = this._detectAllergens(ingredients);
      
      // Generowanie sugestii
      const suggestions = this._generateSuggestions(nutritionalValues, mealData, ingredients);
      
      // Przygotowanie odpowiedzi
      return {
        meal_name: mealData.name,
        original_values: {
          calories: mealData.calories || 0,
          protein: mealData.protein || 0,
          carbs: mealData.carbs || 0,
          fat: mealData.fat || 0
        },
        estimated_values: nutritionalValues,
        comparison: comparisonResult,
        ingredients_analysis: ingredients.map(i => ({
          name: i.name,
          estimated_weight: i.weight,
          nutritional_values: i.nutritionalValues
        })),
        allergens: allergens,
        suggestions: suggestions,
        health_score: this._calculateHealthScore(nutritionalValues, mealData.meal_type),
        confidence_score: 0.85 // Symulacja pewności wyniku
      };
    } catch (error) {
      console.error('Błąd podczas analizy posiłku:', error);
      return {
        error: 'Nie udało się przeanalizować posiłku',
        meal_name: mealData.name,
        message: 'Spróbuj podać bardziej szczegółowy opis składników'
      };
    }
  }

  // Parsowanie składników z opisu
  _parseIngredients(description) {
    const ingredients = [];
    const text = description.toLowerCase();
    
    // Próba znalezienia znanych składników w opisie
    Object.keys(this.ingredientsDatabase).forEach(ingredient => {
      if (text.includes(ingredient)) {
        // Próba znalezienia ilości (np. "100g ryżu", "2 jajka")
        const weightMatch = new RegExp(`(\\d+)\\s*(g|gram|gramów)\\s*${ingredient}`, 'i').exec(text);
        const countMatch = new RegExp(`(\\d+)\\s*${ingredient}`, 'i').exec(text);
        
        let weight = 0;
        if (weightMatch) {
          // Jeśli podano wagę w gramach
          weight = parseInt(weightMatch[1]);
        } else if (countMatch) {
          // Jeśli podano liczbę sztuk
          const count = parseInt(countMatch[1]);
          
          // Przykładowe wagi dla różnych produktów
          const defaultWeights = {
            'jajko': 50, // 1 jajko ~ 50g
            'jabłko': 180, // 1 jabłko ~ 180g
            'banan': 120, // 1 banan ~ 120g
            'chleb': 40, // 1 kromka ~ 40g
            'ziemniak': 150 // 1 ziemniak ~ 150g
          };
          
          weight = count * (defaultWeights[ingredient] || 100);
        } else {
          // Domyślna waga, gdy nie podano ilości
          weight = 100;
        }
        
        // Obliczenie wartości odżywczych dla podanej wagi
        const dbValues = this.ingredientsDatabase[ingredient];
        const nutritionalValues = {
          calories: Math.round((dbValues.calories * weight) / 100),
          protein: parseFloat(((dbValues.protein * weight) / 100).toFixed(1)),
          carbs: parseFloat(((dbValues.carbs * weight) / 100).toFixed(1)),
          fat: parseFloat(((dbValues.fat * weight) / 100).toFixed(1))
        };
        
        ingredients.push({
          name: ingredient,
          weight: weight,
          nutritionalValues: nutritionalValues
        });
      }
    });
    
    // Jeśli nie znaleziono żadnych składników, dodaj generyczne wartości
    if (ingredients.length === 0) {
      // Dodaj przykładowe wartości w zależności od długości opisu
      const baseWeight = 100 + (description.length % 5) * 50; // 100-300g
      
      ingredients.push({
        name: 'składnik nieznany',
        weight: baseWeight,
        nutritionalValues: {
          calories: Math.round(baseWeight * 2), // ~2 kcal/g
          protein: parseFloat((baseWeight * 0.1).toFixed(1)), // ~10% białka
          carbs: parseFloat((baseWeight * 0.3).toFixed(1)), // ~30% węglowodanów
          fat: parseFloat((baseWeight * 0.05).toFixed(1)) // ~5% tłuszczu
        }
      });
    }
    
    return ingredients;
  }

  // Obliczenie całkowitych wartości odżywczych na podstawie składników
  _calculateNutritionalValues(ingredients) {
    const total = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    ingredients.forEach(ingredient => {
      total.calories += ingredient.nutritionalValues.calories;
      total.protein += ingredient.nutritionalValues.protein;
      total.carbs += ingredient.nutritionalValues.carbs;
      total.fat += ingredient.nutritionalValues.fat;
    });
    
    // Zaokrąglenie wartości
    total.calories = Math.round(total.calories);
    total.protein = parseFloat(total.protein.toFixed(1));
    total.carbs = parseFloat(total.carbs.toFixed(1));
    total.fat = parseFloat(total.fat.toFixed(1));
    
    return total;
  }

  // Porównanie wartości podanych przez użytkownika z obliczonymi
  _compareUserValues(calculated, userProvided) {
    const result = {
      calories: { diff: 0, percent: 0 },
      protein: { diff: 0, percent: 0 },
      carbs: { diff: 0, percent: 0 },
      fat: { diff: 0, percent: 0 }
    };
    
    // Jeśli użytkownik podał wartości, porównaj je
    if (userProvided.calories) {
      result.calories.diff = calculated.calories - userProvided.calories;
      result.calories.percent = userProvided.calories ? (result.calories.diff / userProvided.calories) * 100 : 0;
    }
    
    if (userProvided.protein) {
      result.protein.diff = calculated.protein - userProvided.protein;
      result.protein.percent = userProvided.protein ? (result.protein.diff / userProvided.protein) * 100 : 0;
    }
    
    if (userProvided.carbs) {
      result.carbs.diff = calculated.carbs - userProvided.carbs;
      result.carbs.percent = userProvided.carbs ? (result.carbs.diff / userProvided.carbs) * 100 : 0;
    }
    
    if (userProvided.fat) {
      result.fat.diff = calculated.fat - userProvided.fat;
      result.fat.percent = userProvided.fat ? (result.fat.diff / userProvided.fat) * 100 : 0;
    }
    
    // Zaokrąglenie procentów
    Object.keys(result).forEach(key => {
      result[key].percent = parseFloat(result[key].percent.toFixed(1));
    });
    
    return result;
  }

  // Wykrywanie potencjalnych alergenów
  _detectAllergens(ingredients) {
    const allergens = new Set();
    
    ingredients.forEach(ingredient => {
      const dbIngredient = this.ingredientsDatabase[ingredient.name];
      if (dbIngredient && dbIngredient.allergens) {
        dbIngredient.allergens.forEach(allergen => allergens.add(allergen));
      }
    });
    
    return Array.from(allergens);
  }

  // Generowanie sugestii dotyczących posiłku
  _generateSuggestions(nutritionalValues, mealData, ingredients) {
    const suggestions = [];
    const mealType = mealData.meal_type;
    
    // Sugestie dotyczące kalorii
    if (mealType === 'breakfast' && nutritionalValues.calories > 600) {
      suggestions.push('Śniadanie zawiera dużo kalorii. Rozważ zmniejszenie porcji lub wybór lżejszych składników.');
    } else if (mealType === 'dinner' && nutritionalValues.calories > 800) {
      suggestions.push('Kolacja jest dość kaloryczna. Jedząc późno, rozważ lżejszy posiłek.');
    }
    
    // Sugestie dotyczące makroskładników
    if (nutritionalValues.protein < 15 && (mealType === 'lunch' || mealType === 'dinner')) {
      suggestions.push('Ten posiłek zawiera mało białka. Rozważ dodanie kurczaka, ryby, jaj lub roślin strączkowych.');
    }
    
    if (nutritionalValues.fat > 30 && nutritionalValues.calories > 400) {
      suggestions.push('Posiłek zawiera dużo tłuszczu. Rozważ zmniejszenie ilości oleju, masła lub tłustych składników.');
    }
    
    // Sugestie dotyczące składników
    const hasVegetables = ingredients.some(i => 
      ['brokuł', 'marchew', 'pomidor'].includes(i.name)
    );
    
    if (!hasVegetables && (mealType === 'lunch' || mealType === 'dinner')) {
      suggestions.push('Dodaj więcej warzyw, aby zwiększyć wartość odżywczą posiłku.');
    }
    
    // Jeśli nie ma żadnych sugestii, dodaj ogólną pozytywną informację
    if (suggestions.length === 0) {
      suggestions.push('Posiłek wydaje się dobrze zbilansowany pod względem wartości odżywczych.');
    }
    
    return suggestions;
  }

  // Obliczenie ogólnej oceny zdrowotnej posiłku (1-10)
  _calculateHealthScore(nutritionalValues, mealType) {
    let score = 7; // Początkowa ocena
    
    // Ocena zależna od proporcji makroskładników
    const totalCals = nutritionalValues.calories || 1; // Unikaj dzielenia przez zero
    const proteinCals = nutritionalValues.protein * 4;
    const carbsCals = nutritionalValues.carbs * 4;
    const fatCals = nutritionalValues.fat * 9;
    
    const proteinPercent = (proteinCals / totalCals) * 100;
    const carbsPercent = (carbsCals / totalCals) * 100;
    const fatPercent = (fatCals / totalCals) * 100;
    
    // Idealne proporcje: ~30% białka, ~45% węglowodanów, ~25% tłuszczu
    // Odejmij punkty za duże odchylenia
    score -= Math.abs(proteinPercent - 30) > 15 ? 1 : 0;
    score -= Math.abs(carbsPercent - 45) > 20 ? 1 : 0;
    score -= Math.abs(fatPercent - 25) > 15 ? 1 : 0;
    
    // Ocena zależna od kalorii i typu posiłku
    if (mealType === 'breakfast') {
      // Śniadanie powinno mieć ~20-25% dziennego zapotrzebowania (~400-600 kcal)
      score -= nutritionalValues.calories < 300 ? 1 : 0;
      score -= nutritionalValues.calories > 700 ? 1 : 0;
    } else if (mealType === 'lunch') {
      // Obiad powinien mieć ~30-35% dziennego zapotrzebowania (~600-800 kcal)
      score -= nutritionalValues.calories < 400 ? 1 : 0;
      score -= nutritionalValues.calories > 900 ? 1 : 0;
    } else if (mealType === 'dinner') {
      // Kolacja powinna mieć ~20-25% dziennego zapotrzebowania (~400-600 kcal)
      score -= nutritionalValues.calories < 300 ? 1 : 0;
      score -= nutritionalValues.calories > 700 ? 2 : 0; // Większa kara za zbyt kaloryczną kolację
    } else if (mealType === 'snack') {
      // Przekąska powinna mieć ~10-15% dziennego zapotrzebowania (~200-300 kcal)
      score -= nutritionalValues.calories < 100 ? 1 : 0;
      score -= nutritionalValues.calories > 400 ? 1 : 0;
    }
    
    // Ograniczenie wyniku do zakresu 1-10
    return Math.max(1, Math.min(10, score));
  }
}

module.exports = new AIService();
