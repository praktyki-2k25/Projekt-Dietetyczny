const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { 
  getAiAnalysis, 
  getDietRecommendations, 
  getPrompt,
  fillPromptTemplate
} = require('../services/ai-service');
const Meal = require('../models/Meal');

/**
 * Endpoint do analizy posiłku przez AI bez zapisywania
 */
router.post('/analyze-meal', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nazwa posiłku jest wymagana' });
    }
    
    if (process.env.AI_ENABLED !== 'true') {
      return res.status(400).json({ 
        error: 'Usługa AI nie jest włączona', 
        message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
      });
    }
    
    const analysis = await getAiAnalysis({ name, description });
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint do generowania rekomendacji dietetycznych na podstawie historii
 */
router.get('/diet-recommendations', authenticateToken, async (req, res) => {
  try {
    if (process.env.AI_ENABLED !== 'true') {
      return res.status(400).json({ 
        error: 'Usługa AI nie jest włączona', 
        message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
      });
    }
    
    // Pobieramy dane użytkownika
    const userData = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (!userData) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    
    // Pobieramy historię posiłków
    const meals = await query('SELECT * FROM meals WHERE user_id = ? ORDER BY meal_date DESC LIMIT 20', [req.user.id]);
    
    // Generujemy rekomendacje
    const recommendations = await getDietRecommendations(userData, meals);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint do pobierania wszystkich promptów
 */
router.get('/prompts', authenticateToken, async (req, res) => {
  try {
    const prompts = await query('SELECT id, name, description FROM ai_prompts');
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint do pobierania pojedynczego promptu
 */
router.get('/prompts/:name', authenticateToken, async (req, res) => {
  try {
    const promptText = await getPrompt(req.params.name);
    res.json({ name: req.params.name, prompt_text: promptText });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Endpoint do dodawania nowego promptu
 */
router.post('/prompts', authenticateToken, async (req, res) => {
  try {
    const { name, prompt_text, description } = req.body;
    
    if (!name || !prompt_text) {
      return res.status(400).json({ error: 'Nazwa i tekst promptu są wymagane' });
    }
    
    // Sprawdzamy czy prompt już istnieje
    const existingPrompt = await queryOne('SELECT id FROM ai_prompts WHERE name = ?', [name]);
    
    if (existingPrompt) {
      return res.status(409).json({ error: 'Prompt o takiej nazwie już istnieje' });
    }
    
    const result = await run(
      'INSERT INTO ai_prompts (name, prompt_text, description) VALUES (?, ?, ?)',
      [name, prompt_text, description || '']
    );
    
    res.status(201).json({ 
      id: result.id,
      name,
      prompt_text,
      description,
      message: 'Prompt został dodany'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint do aktualizacji promptu
 */
router.put('/prompts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt_text, description } = req.body;
    
    if (!prompt_text) {
      return res.status(400).json({ error: 'Tekst promptu jest wymagany' });
    }
    
    const result = await run(
      'UPDATE ai_prompts SET prompt_text = ?, description = ? WHERE id = ?',
      [prompt_text, description || '', id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prompt nie znaleziony' });
    }
    
    res.json({ 
      id: parseInt(id),
      prompt_text,
      description,
      message: 'Prompt został zaktualizowany'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint do testowania promptu z danymi
 */
router.post('/test-prompt', authenticateToken, async (req, res) => {
  try {
    const { prompt_name, variables } = req.body;
    
    if (!prompt_name) {
      return res.status(400).json({ error: 'Nazwa promptu jest wymagana' });
    }
    
    if (process.env.AI_ENABLED !== 'true') {
      return res.status(400).json({ 
        error: 'Usługa AI nie jest włączona',
        message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
      });
    }
    
    // Pobieramy treść promptu
    const promptText = await getPrompt(prompt_name);
    
    // Wypełniamy prompt zmiennymi
    const filledPrompt = fillPromptTemplate(promptText, variables || {});
    
    // Tutaj miejsce na wywołanie modelu językowego
    // Obecnie zwracamy tylko wypełniony prompt
    
    res.json({
      prompt: filledPrompt,
      result: "Tutaj będzie odpowiedź z modelu językowego"
    });
  } catch (error) {
    if (error.message.includes('nie znaleziony')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint do usuwania promptu
 */
router.delete('/prompts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await run('DELETE FROM ai_prompts WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prompt nie znaleziony' });
    }
    
    res.json({ message: 'Prompt został usunięty' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;