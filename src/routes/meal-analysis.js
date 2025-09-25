const express = require('express');
const router = express.Router();
const { query, run } = require('../database/connection');
const { getAiAnalysis } = require('../services/ai-service');
const { authenticateToken } = require('../middleware/auth');

/**
 * Endpoint do analizy posiłku na podstawie składników
 * Ta funkcja jest używana przez formularz analizy na froncie
 */
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { name, ingredients, meal_type } = req.body;
    
    if (!name || !ingredients) {
      return res.status(400).json({ 
        error: 'Nazwa posiłku i składniki są wymagane',
        message: 'Proszę podać zarówno nazwę posiłku jak i składniki' 
      });
    }

    console.log('Otrzymano żądanie analizy posiłku:', {name, ingredients});
    
    if (process.env.AI_ENABLED !== 'true') {
      return res.status(400).json({ 
        error: 'Usługa AI nie jest włączona', 
        message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
      });
    }
    
    // Łączymy informacje o posiłku do analizy
    const description = `Składniki: ${ingredients}`;
    
    try {
      console.log('Wysyłanie do AI analizy:', { name, description });
      const analysis = await getAiAnalysis({ name, description });
      
      if (!analysis) {
        return res.status(500).json({
          error: 'Nie udało się przeprowadzić analizy AI',
          message: 'Spróbuj ponownie później'
        });
      }
      
      console.log('Otrzymano analizę AI:', JSON.stringify(analysis, null, 2));
      
      // Zwróć wynik analizy
      res.json(analysis);
    } catch (aiError) {
      console.error('Błąd analizy AI:', aiError);
      res.status(500).json({ 
        error: 'Wystąpił błąd podczas analizy składników', 
        details: aiError.message 
      });
    }
  } catch (error) {
    console.error('Nieoczekiwany błąd:', error);
    res.status(500).json({ error: 'Wystąpił błąd serwera', details: error.message });
  }
});

/**
 * Endpoint do tworzenia posiłku z analizą AI
 */
router.post('/with-analysis', authenticateToken, async (req, res) => {
  try {
    const { name, ingredients, meal_date, meal_type } = req.body;
    
    if (!name || !ingredients) {
      return res.status(400).json({ error: 'Nazwa posiłku i składniki są wymagane' });
    }
    
    if (process.env.AI_ENABLED !== 'true') {
      return res.status(400).json({ 
        error: 'Usługa AI nie jest włączona', 
        message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
      });
    }
    
    // Łączymy informacje o posiłku do analizy
    const description = `Składniki: ${ingredients}`;
    
    // Przeprowadzenie analizy AI
    const analysis = await getAiAnalysis({ name, description });
    
    if (!analysis) {
      return res.status(500).json({ error: 'Nie udało się przeprowadzić analizy AI' });
    }
    
    // Dzisiejsza data
    const today = new Date().toISOString().split('T')[0];
    
    // Zapisanie posiłku w bazie danych
    const result = await run(`
      INSERT INTO meals (
        user_id, name, description, calories, protein, 
        carbs, fat, meal_date, meal_type, ai_analysis
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      name,
      description,
      analysis.estimated_values.calories,
      analysis.estimated_values.protein,
      analysis.estimated_values.carbs,
      analysis.estimated_values.fat,
      meal_date || today,
      meal_type || 'other',
      JSON.stringify(analysis)
    ]);
    
    // Pobierz dodany posiłek
    const meal = await query('SELECT * FROM meals WHERE id = ?', [result.id]);
    
    // Przetworzenie analizy AI z JSON string do obiektu
    try {
      meal[0].ai_analysis = JSON.parse(meal[0].ai_analysis);
    } catch (e) {
      // Ignoruj błędy parsowania
    }
    
    res.status(201).json({ 
      meal: meal[0],
      ai_analysis: analysis 
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia posiłku z analizą:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;