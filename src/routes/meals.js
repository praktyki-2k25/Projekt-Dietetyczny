const express = require('express');
const router = express.Router();
const { db, query, queryOne, run } = require('../database/connection');
const { getAiAnalysis } = require('../services/ai-service');
const { authenticateToken } = require('../middleware/auth');

// Pobieranie wszystkich posiłków użytkownika
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, startDate, endDate, type, sort = 'desc', limit = 100, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM meals WHERE user_id = ?';
    const params = [req.user.id];
    
    // Filtrowanie po dacie
    if (date) {
      sql += ' AND meal_date = ?';
      params.push(date);
    }
    
    // Filtrowanie po zakresie dat
    if (startDate && endDate) {
      sql += ' AND meal_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    // Filtrowanie po typie posiłku
    if (type) {
      sql += ' AND meal_type = ?';
      params.push(type);
    }
    
    // Sortowanie
    sql += ` ORDER BY meal_date ${sort === 'asc' ? 'ASC' : 'DESC'}, created_at DESC`;
    
    // Paginacja
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const meals = await query(sql, params);
    
    // Przetwarzanie danych AI do poprawnego formatu JSON
    const processedMeals = meals.map(meal => {
      if (meal.ai_analysis) {
        try {
          meal.ai_analysis = JSON.parse(meal.ai_analysis);
        } catch (e) {
          // Jeśli nie można sparsować, zostawiamy jako string
        }
      }
      return meal;
    });
    
    res.json(processedMeals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pobieranie pojedynczego posiłku
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const mealId = req.params.id;
    
    const meal = await queryOne('SELECT * FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id]);
    
    if (!meal) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    // Przetworzenie analizy AI z JSON string do obiektu
    if (meal.ai_analysis) {
      try {
        meal.ai_analysis = JSON.parse(meal.ai_analysis);
      } catch (e) {
        // Jeśli nie można sparsować, zostawiamy jako string
      }
    }
    
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dodawanie nowego posiłku
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, calories, protein, carbs, fat, meal_date, meal_type } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nazwa posiłku jest wymagana' });
    }
    
    // Analiza AI jeśli włączona
    let aiAnalysis = null;
    if (process.env.AI_ENABLED === 'true') {
      try {
        aiAnalysis = await getAiAnalysis({ name, description });
      } catch (aiError) {
        console.error('Błąd AI:', aiError.message);
        // Kontynuujemy bez analizy AI w przypadku błędu
      }
    }
    
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Przygotowanie danych posiłku
    const result = await run(`
      INSERT INTO meals (
        user_id, name, description, calories, protein, 
        carbs, fat, meal_date, meal_type, ai_analysis
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      name,
      description || '',
      calories || (aiAnalysis ? aiAnalysis.estimated_values.calories : null),
      protein || (aiAnalysis ? aiAnalysis.estimated_values.protein : null),
      carbs || (aiAnalysis ? aiAnalysis.estimated_values.carbs : null),
      fat || (aiAnalysis ? aiAnalysis.estimated_values.fat : null),
      meal_date || today,
      meal_type || null,
      aiAnalysis ? JSON.stringify(aiAnalysis) : null
    ]);
    
    // Pobierz dodany posiłek
    const meal = await queryOne('SELECT * FROM meals WHERE id = ?', [result.id]);
    
    // Przetworzenie analizy AI z JSON string do obiektu
    if (meal.ai_analysis) {
      try {
        meal.ai_analysis = JSON.parse(meal.ai_analysis);
      } catch (e) {
        // Jeśli nie można sparsować, zostawiamy jako string
      }
    }
    
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizacja posiłku
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const mealId = req.params.id;
    const { name, description, calories, protein, carbs, fat, meal_date, meal_type } = req.body;
    
    // Sprawdzenie czy posiłek istnieje
    const existingMeal = await queryOne('SELECT * FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id]);
    
    if (!existingMeal) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    // Przygotowanie wartości do aktualizacji
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (calories !== undefined) updates.calories = calories;
    if (protein !== undefined) updates.protein = protein;
    if (carbs !== undefined) updates.carbs = carbs;
    if (fat !== undefined) updates.fat = fat;
    if (meal_date !== undefined) updates.meal_date = meal_date;
    if (meal_type !== undefined) updates.meal_type = meal_type;
    
    // Analiza AI jeśli włączona i zmieniono nazwę lub opis
    if (process.env.AI_ENABLED === 'true' && (name !== undefined || description !== undefined)) {
      try {
        const aiAnalysis = await getAiAnalysis({ 
          name: name || existingMeal.name, 
          description: description || existingMeal.description
        });
        
        updates.ai_analysis = JSON.stringify(aiAnalysis);
        
        // Aktualizacja wartości odżywczych z AI, jeśli nie podano ręcznie
        if (calories === undefined && aiAnalysis.estimated_values.calories) {
          updates.calories = aiAnalysis.estimated_values.calories;
        }
        if (protein === undefined && aiAnalysis.estimated_values.protein) {
          updates.protein = aiAnalysis.estimated_values.protein;
        }
        if (carbs === undefined && aiAnalysis.estimated_values.carbs) {
          updates.carbs = aiAnalysis.estimated_values.carbs;
        }
        if (fat === undefined && aiAnalysis.estimated_values.fat) {
          updates.fat = aiAnalysis.estimated_values.fat;
        }
      } catch (aiError) {
        console.error('Błąd AI:', aiError.message);
      }
    }
    
    // Jeśli nie ma nic do aktualizacji
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Brak danych do aktualizacji' });
    }
    
    // Budowanie zapytania SQL
    const fields = Object.keys(updates).map(key => `${key} = ?`);
    const values = Object.values(updates);
    
    // Dodanie id i user_id do parametrów
    values.push(mealId, req.user.id);
    
    const result = await run(
      `UPDATE meals SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Nie zaktualizowano żadnych danych' });
    }
    
    // Pobierz zaktualizowany posiłek
    const updatedMeal = await queryOne('SELECT * FROM meals WHERE id = ?', [mealId]);
    
    // Przetworzenie analizy AI z JSON string do obiektu
    if (updatedMeal.ai_analysis) {
      try {
        updatedMeal.ai_analysis = JSON.parse(updatedMeal.ai_analysis);
      } catch (e) {
        // Jeśli nie można sparsować, zostawiamy jako string
      }
    }
    
    res.json(updatedMeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Usuwanie posiłku
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const mealId = req.params.id;
    
    const result = await run('DELETE FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    res.json({ message: 'Posiłek został usunięty' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uzyskaj podsumowanie dzienne
router.get('/summary/daily', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0]; // Domyślnie dzisiejsza data
    
    // Pobierz wszystkie posiłki z danego dnia
    const meals = await query(
      'SELECT * FROM meals WHERE user_id = ? AND meal_date = ? ORDER BY meal_type', 
      [req.user.id, targetDate]
    );
    
    // Oblicz sumę makroskładników
    const summary = {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      meals_count: meals.length,
      date: targetDate,
      meals_by_type: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        other: []
      }
    };
    
    meals.forEach(meal => {
      // Dodaj wartości odżywcze
      summary.total_calories += meal.calories || 0;
      summary.total_protein += meal.protein || 0;
      summary.total_carbs += meal.carbs || 0;
      summary.total_fat += meal.fat || 0;
      
      // Przetwarzanie analizy AI
      if (meal.ai_analysis) {
        try {
          meal.ai_analysis = JSON.parse(meal.ai_analysis);
        } catch (e) {
          // Ignoruj błędy parsowania
        }
      }
      
      // Grupuj posiłki według typu
      const type = meal.meal_type || 'other';
      if (summary.meals_by_type[type]) {
        summary.meals_by_type[type].push(meal);
      } else {
        summary.meals_by_type.other.push(meal);
      }
    });
    
    // Zaokrąglij wartości
    summary.total_protein = parseFloat(summary.total_protein.toFixed(1));
    summary.total_carbs = parseFloat(summary.total_carbs.toFixed(1));
    summary.total_fat = parseFloat(summary.total_fat.toFixed(1));
    
    // Pobieranie danych użytkownika do kalkulacji celów
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    // Obliczenie dziennego zapotrzebowania kalorycznego
    let dailyCalories = 2000; // Domyślna wartość
    let proteinGoal = 75;
    let carbsGoal = 250;
    let fatGoal = 67;
    
    if (user && user.weight && user.height && user.age) {
      // Podstawowe tempo metaboliczne (BMR) według wzoru Harrisa-Benedicta
      let bmr = 0;
      if (user.gender === 'male') {
        bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
      } else {
        bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
      }
      
      // Mnożnik aktywności (zakładamy umiarkowaną aktywność)
      const activityMultiplier = user.activity_level === 'high' ? 1.725 : 
                                user.activity_level === 'low' ? 1.375 : 1.55;
      
      dailyCalories = Math.round(bmr * activityMultiplier);
      proteinGoal = Math.round((dailyCalories * 0.15) / 4); // 15% kalorii z białka
      carbsGoal = Math.round((dailyCalories * 0.50) / 4); // 50% kalorii z węglowodanów
      fatGoal = Math.round((dailyCalories * 0.30) / 9); // 30% kalorii z tłuszczów
    }
    
    summary.daily_goals = {
      calories: dailyCalories,
      protein: proteinGoal,
      carbs: carbsGoal,
      fat: fatGoal
    };
    
    summary.percent_of_daily = {
      calories: Math.round((summary.total_calories / summary.daily_goals.calories) * 100),
      protein: Math.round((summary.total_protein / summary.daily_goals.protein) * 100),
      carbs: Math.round((summary.total_carbs / summary.daily_goals.carbs) * 100),
      fat: Math.round((summary.total_fat / summary.daily_goals.fat) * 100)
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Udostępnianie posiłku innemu użytkownikowi
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const mealId = req.params.id;
    const { email, message } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email użytkownika jest wymagany' });
    }
    
    // Sprawdzenie czy posiłek istnieje i należy do użytkownika
    const meal = await queryOne('SELECT * FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id]);
    
    if (!meal) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    // Znajdź użytkownika, któremu chcemy udostępnić posiłek
    const targetUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika o podanym adresie email' });
    }
    
    // Dodaj kopię posiłku dla użytkownika docelowego
    const result = await run(`
      INSERT INTO meals (
        user_id, name, description, calories, protein, 
        carbs, fat, meal_date, meal_type, ai_analysis
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      targetUser.id,
      meal.name + ' (udostępniony)',
      message ? (meal.description + '\n\nWiadomość: ' + message) : meal.description,
      meal.calories,
      meal.protein,
      meal.carbs,
      meal.fat,
      new Date().toISOString().split('T')[0], // Dzisiejsza data
      meal.meal_type,
      meal.ai_analysis
    ]);
    
    res.json({ 
      message: 'Posiłek został udostępniony', 
      shared_meal_id: result.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;