const express = require('express');
const router = express.Router();
const { db } = require('../database/connection');
const aiService = require('../services/ai-service');
const { authenticateToken } = require('../middleware/auth'); // Importujemy middleware autoryzacji

// Pobieranie wszystkich posiłków użytkownika
router.get('/', authenticateToken, (req, res) => {
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
  sql += ' ORDER BY meal_date ' + (sort === 'asc' ? 'ASC' : 'DESC') + ', created_at DESC';
  
  // Paginacja
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, meals) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(meals);
  });
});

// Pobieranie pojedynczego posiłku
router.get('/:id', authenticateToken, (req, res) => {
  const mealId = req.params.id;
  
  db.get('SELECT * FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id], (err, meal) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!meal) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    res.json(meal);
  });
});

// Dodawanie nowego posiłku
router.post('/', authenticateToken, (req, res) => {
  const { name, description, calories, protein, carbs, fat, meal_date, meal_type } = req.body;
  
  // Walidacja
  if (!name) {
    return res.status(400).json({ error: 'Nazwa posiłku jest wymagana' });
  }
  
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  db.run(`
    INSERT INTO meals (
      user_id, name, description, calories, protein, 
      carbs, fat, meal_date, meal_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    req.user.id,
    name,
    description || '',
    calories || null,
    protein || null,
    carbs || null,
    fat || null,
    meal_date || today,
    meal_type || null
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Pobierz dodany posiłek
    db.get('SELECT * FROM meals WHERE id = ?', [this.lastID], (err, meal) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json(meal);
    });
  });
});

// Aktualizacja posiłku
router.put('/:id', authenticateToken, (req, res) => {
  const mealId = req.params.id;
  const { name, description, calories, protein, carbs, fat, meal_date, meal_type } = req.body;
  
  // Sprawdzenie czy posiłek istnieje i należy do użytkownika
  db.get('SELECT * FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id], (err, meal) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!meal) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    // Aktualizacja posiłku
    db.run(`
      UPDATE meals SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        calories = COALESCE(?, calories),
        protein = COALESCE(?, protein),
        carbs = COALESCE(?, carbs),
        fat = COALESCE(?, fat),
        meal_date = COALESCE(?, meal_date),
        meal_type = COALESCE(?, meal_type)
      WHERE id = ? AND user_id = ?
    `, [
      name,
      description,
      calories,
      protein,
      carbs,
      fat,
      meal_date,
      meal_type,
      mealId,
      req.user.id
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Nie zaktualizowano żadnych danych' });
      }
      
      // Pobierz zaktualizowany posiłek
      db.get('SELECT * FROM meals WHERE id = ?', [mealId], (err, updatedMeal) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json(updatedMeal);
      });
    });
  });
});

// Usuwanie posiłku
router.delete('/:id', authenticateToken, (req, res) => {
  const mealId = req.params.id;
  
  db.run('DELETE FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    res.json({ message: 'Posiłek został usunięty' });
  });
});

// Endpoint do analizy posiłku przez AI
router.post('/analyze', authenticateToken, async (req, res) => {
  const { name, ingredients, calories, protein, carbs, fat, meal_type } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nazwa posiłku jest wymagana' });
  }
  
  try {
    // Wywołanie serwisu AI do analizy posiłku
    const analysis = await aiService.analyzeMeal({
      name,
      ingredients: ingredients || '',
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      meal_type: meal_type || 'unknown'
    });
    
    res.json(analysis);
  } catch (error) {
    console.error('Błąd podczas analizy posiłku:', error);
    res.status(500).json({ error: 'Nie udało się przeanalizować posiłku', message: error.message });
  }
});

// Dodawanie nowego posiłku z analizą AI
router.post('/with-analysis', authenticateToken, async (req, res) => {
  const { name, description, ingredients, calories, protein, carbs, fat, meal_date, meal_type } = req.body;
  
  // Walidacja
  if (!name) {
    return res.status(400).json({ error: 'Nazwa posiłku jest wymagana' });
  }
  
  try {
    // Analiza posiłku przez AI
    let aiAnalysis = null;
    if (ingredients || description) {
      aiAnalysis = await aiService.analyzeMeal({
        name,
        ingredients: ingredients || description || '',
        calories,
        protein,
        carbs,
        fat,
        meal_type: meal_type || 'unknown'
      });
    }
    
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const mealValues = {
      user_id: req.user.id,
      name,
      description: description || '',
      calories: aiAnalysis ? aiAnalysis.estimated_values.calories : (calories || null),
      protein: aiAnalysis ? aiAnalysis.estimated_values.protein : (protein || null),
      carbs: aiAnalysis ? aiAnalysis.estimated_values.carbs : (carbs || null),
      fat: aiAnalysis ? aiAnalysis.estimated_values.fat : (fat || null),
      meal_date: meal_date || today,
      meal_type: meal_type || null
    };
    
    // Zapis posiłku do bazy danych
    db.run(`
      INSERT INTO meals (
        user_id, name, description, calories, protein, 
        carbs, fat, meal_date, meal_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mealValues.user_id,
      mealValues.name,
      mealValues.description,
      mealValues.calories,
      mealValues.protein,
      mealValues.carbs,
      mealValues.fat,
      mealValues.meal_date,
      mealValues.meal_type
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Pobierz dodany posiłek
      db.get('SELECT * FROM meals WHERE id = ?', [this.lastID], (err, meal) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.status(201).json({
          meal,
          ai_analysis: aiAnalysis
        });
      });
    });
  } catch (error) {
    console.error('Błąd podczas dodawania posiłku z analizą:', error);
    res.status(500).json({ error: 'Nie udało się dodać posiłku', message: error.message });
  }
});

// Uzyskaj podsumowanie dzienne
router.get('/summary/daily', authenticateToken, async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0]; // Domyślnie dzisiejsza data
  
  try {
    // Pobierz wszystkie posiłki z danego dnia
    db.all('SELECT * FROM meals WHERE user_id = ? AND meal_date = ? ORDER BY meal_type', 
      [req.user.id, targetDate], 
      (err, meals) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
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
        
        // Dodaj przybliżone zapotrzebowanie dzienne (2000 kcal)
        summary.daily_goals = {
          calories: 2000,
          protein: 75, // ~15% kalorii z białka
          carbs: 250, // ~50% kalorii z węglowodanów
          fat: 67 // ~30% kalorii z tłuszczów
        };
        
        summary.percent_of_daily = {
          calories: Math.round((summary.total_calories / summary.daily_goals.calories) * 100),
          protein: Math.round((summary.total_protein / summary.daily_goals.protein) * 100),
          carbs: Math.round((summary.total_carbs / summary.daily_goals.carbs) * 100),
          fat: Math.round((summary.total_fat / summary.daily_goals.fat) * 100)
        };
        
        res.json(summary);
    });
  } catch (error) {
    console.error('Błąd podczas pobierania podsumowania dziennego:', error);
    res.status(500).json({ error: 'Nie udało się pobrać podsumowania', message: error.message });
  }
});

// Udostępnianie posiłku innemu użytkownikowi
router.post('/:id/share', authenticateToken, (req, res) => {
  const mealId = req.params.id;
  const { email, message } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email użytkownika jest wymagany' });
  }
  
  // Sprawdzenie czy posiłek istnieje i należy do użytkownika
  db.get('SELECT * FROM meals WHERE id = ? AND user_id = ?', [mealId, req.user.id], (err, meal) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!meal) {
      return res.status(404).json({ error: 'Posiłek nie znaleziony' });
    }
    
    // Znajdź użytkownika, któremu chcemy udostępnić posiłek
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, targetUser) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!targetUser) {
        return res.status(404).json({ error: 'Nie znaleziono użytkownika o podanym adresie email' });
      }
      
      // Dodaj kopię posiłku dla użytkownika docelowego
      db.run(`
        INSERT INTO meals (
          user_id, name, description, calories, protein, 
          carbs, fat, meal_date, meal_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        targetUser.id,
        meal.name + ' (udostępniony)',
        message ? (meal.description + '\n\nWiadomość: ' + message) : meal.description,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        new Date().toISOString().split('T')[0], // Dzisiejsza data
        meal.meal_type
      ], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({ 
          message: 'Posiłek został udostępniony', 
          shared_meal_id: this.lastID 
        });
      });
    });
  });
});

module.exports = router;
