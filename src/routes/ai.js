const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { query, queryOne, run } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { 
  getAiAnalysis, 
  getDietRecommendations, 
  getPrompt,
  fillPromptTemplate,
  analyzeImage,
  getImageDescription
} = require('../services/ai-service');
const Meal = require('../models/Meal');

/**
 * Sprawdza czy AI jest włączone
 */
const checkAiEnabled = () => {
  if (process.env.AI_ENABLED !== 'true') {
    return {
      enabled: false,
      error: 'Usługa AI nie jest włączona',
      message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
    };
  }
  return { enabled: true };
};

/**
 * Obsługa błędów AI
 */
const handleAiError = (error, res) => {
  console.error('Błąd AI:', error);
  
  return res.status(500).json({ 
    error: 'Nie udało się przetworzyć żądania przez AI', 
    message: error.message,
    details: 'Upewnij się, że serwis AI jest uruchomiony i działa poprawnie'
  });
};

/**
 * Ogólna obsługa błędów
 */
const handleError = (error, res, message = 'Wystąpił błąd serwera') => {
  console.error(message, error);
  return res.status(500).json({ error: message, details: error.message });
};

// Konfiguracja przechowywania zdjęć
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/meals');
    // Upewnij się, że folder istnieje
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generowanie unikalnej nazwy pliku
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrowanie typów plików
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Nieprawidłowy format pliku. Akceptowane formaty to: jpeg, jpg, png.'), false);
  }
};

// Inicjalizacja multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * Endpoint do analizy posiłku przez AI bez zapisywania
 */
router.post('/analyze-meal', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nazwa posiłku jest wymagana' });
    }
    
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
      });
    }
    
    const analysis = await getAiAnalysis({ name, description });
    res.json({ analysis });
  } catch (error) {
    return handleError(error, res, 'Błąd przetwarzania żądania analizy posiłku');
  }
});

/**
 * Endpoint do uzyskania prostego opisu zdjęcia posiłku (bez wartości odżywczych)
 */
router.post('/describe-image', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'meal_image', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
  try {
    // Znajdź i zwaliduj przesłany plik
    const file = getUploadedFile(req);
    const validation = validateFile(file);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error, 
        message: validation.message 
      });
    }
    
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
      });
    }
    
    // Ścieżka do zapisanego zdjęcia
    const imagePath = file.path;
    
    try {
      // Analiza zdjęcia przez AI - prosty opis
      const description = await getImageDescription(imagePath);
      
      // Zwróć wynik analizy
      res.json({ 
        description,
        image_url: `/uploads/meals/${path.basename(imagePath)}`
      });
    } catch (aiError) {
      return handleAiError(aiError, res);
    }
  } catch (error) {
    return handleError(error, res, 'Błąd przetwarzania zdjęcia');
  }
});

/**
 * Znajduje przesłany plik z formularza
 */
const getUploadedFile = (req) => {
  if (!req.files) return null;
  
  const fieldNames = ['image', 'meal_image', 'file', 'photo'];
  
  for (const fieldName of fieldNames) {
    if (req.files[fieldName] && req.files[fieldName].length > 0) {
      return req.files[fieldName][0];
    }
  }
  
  return null;
};

/**
 * Sprawdza plik pod kątem poprawności
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Brak zdjęcia posiłku' };
  }
  
  // Sprawdź typ pliku (MIME)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    console.error(`Nieprawidłowy typ pliku: ${file.mimetype}`);
    return {
      valid: false,
      error: 'Nieprawidłowy format pliku',
      message: 'Dozwolone formaty to: JPEG, JPG, PNG'
    };
  }
  
  // Sprawdź rozmiar pliku (maks. 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    console.error(`Zbyt duży plik: ${file.size} bajtów`);
    return {
      valid: false, 
      error: 'Plik jest zbyt duży',
      message: 'Maksymalny rozmiar pliku to 5MB'
    };
  }
  
  return { valid: true };
};
router.post('/analyze-meal-photo', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'meal_image', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
  try {
    // Znajdź i zwaliduj przesłany plik
    const file = getUploadedFile(req);
    const validation = validateFile(file);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error,
        message: validation.message 
      });
    }
    
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
      });
    }
    
    // Ścieżka do zapisanego zdjęcia
    const imagePath = file.path;
    console.log('Analizowanie zdjęcia z:', imagePath);
    console.log('Rozmiar pliku:', file.size, 'bajtów');
    console.log('Typ MIME:', file.mimetype);
    
    try {
      // Analiza zdjęcia przez AI
      const analysis = await analyzeImage(imagePath);
      
      // Zwróć wynik analizy
      res.json({ 
        analysis,
        image_url: `/uploads/meals/${path.basename(imagePath)}`
      });
    } catch (aiError) {
      return handleAiError(aiError, res);
    }
  } catch (error) {
    return handleError(error, res, 'Błąd przetwarzania zdjęcia');
  }
});

/**
 * Endpoint do zapisywania posiłku ze zdjęcia
 */
router.post('/save-meal-from-photo', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'meal_image', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
  try {
    // Znajdź i zwaliduj przesłany plik
    const file = getUploadedFile(req);
    const validation = validateFile(file);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error, 
        message: validation.message 
      });
    }
    
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
      });
    }
    
    // Ścieżka do zapisanego zdjęcia
    const imagePath = file.path;
    
    try {
      // Analiza zdjęcia przez AI
      const analysis = await analyzeImage(imagePath);
      
      // Przygotowanie danych posiłku na podstawie analizy
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const mealData = {
        user_id: req.user.id,
        name: analysis.meal_name || 'Posiłek ze zdjęcia',
        description: analysis.ingredients ? `Składniki: ${analysis.ingredients.join(', ')}` : '',
        calories: analysis.estimated_values.calories || null,
        protein: analysis.estimated_values.protein || null,
        carbs: analysis.estimated_values.carbs || null,
        fat: analysis.estimated_values.fat || null,
        meal_date: req.body.meal_date || today,
        meal_type: req.body.meal_type || null,
        ai_analysis: JSON.stringify(analysis),
        image_path: imagePath
      };
      
      // Zapisz posiłek w bazie danych
      const result = await run(`
        INSERT INTO meals (
          user_id, name, description, calories, protein, 
          carbs, fat, meal_date, meal_type, ai_analysis, image_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mealData.user_id,
        mealData.name,
        mealData.description,
        mealData.calories,
        mealData.protein,
        mealData.carbs,
        mealData.fat,
        mealData.meal_date,
        mealData.meal_type,
        mealData.ai_analysis,
        mealData.image_path
      ]);
      
      // Pobierz zapisany posiłek
      const savedMeal = await queryOne('SELECT * FROM meals WHERE id = ?', [result.id]);
      
      // Przetworzenie analizy AI z JSON string do obiektu
      if (savedMeal.ai_analysis) {
        try {
          savedMeal.ai_analysis = JSON.parse(savedMeal.ai_analysis);
        } catch (e) {
          // Jeśli nie można sparsować, zostawiamy jako string
        }
      }
      
      // Zwróć zapisany posiłek
      res.status(201).json({
        meal: savedMeal,
        message: 'Posiłek został zapisany na podstawie analizy zdjęcia'
      });
    } catch (aiError) {
      return handleAiError(aiError, res);
    }
  } catch (error) {
    return handleError(error, res, 'Błąd przetwarzania zdjęcia');
  }
});

/**
 * Endpoint do generowania rekomendacji dietetycznych na podstawie historii
 */
router.get('/diet-recommendations', authenticateToken, async (req, res) => {
  try {
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
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
    return handleError(error, res, 'Błąd generowania rekomendacji dietetycznych');
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
    return handleError(error, res, 'Błąd pobierania promptów');
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
    if (error.message.includes('nie znaleziony')) {
      return res.status(404).json({ error: error.message });
    }
    return handleError(error, res, 'Błąd pobierania promptu');
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
    return handleError(error, res, 'Błąd dodawania promptu');
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
    return handleError(error, res, 'Błąd aktualizacji promptu');
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
    
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
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
    return handleError(error, res, 'Błąd testowania promptu');
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
    return handleError(error, res, 'Błąd usuwania promptu');
  }
});

/**
 * Endpoint do generowania inteligentnych przypomnień
 */
router.get('/smart-reminders', authenticateToken, async (req, res) => {
  try {
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
      });
    }
    
    // Pobieramy dane użytkownika
    const userData = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (!userData) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    
    // Pobieramy posiłki z ostatnich 3 dni
    const recentMeals = await query(
      'SELECT * FROM meals WHERE user_id = ? AND meal_date >= date("now", "-3 days") ORDER BY meal_date DESC', 
      [req.user.id]
    );
    
    // Generujemy przypomnienia na podstawie historii posiłków
    // (to byłoby zintegrowane z serwisem AI, teraz zwracamy mockowe dane)
    const reminders = [
      {
        type: 'protein',
        message: 'Twoje spożycie białka jest niskie od 2 dni. Rozważ dodanie więcej mięsa, ryb lub roślinnych źródeł białka.',
        priority: 'high'
      },
      {
        type: 'water',
        message: 'Pamiętaj o regularnym piciu wody - minimum 2 litry dziennie!',
        priority: 'medium'
      },
      {
        type: 'vegetables',
        message: 'Dodaj więcej warzyw do swojej diety dla lepszego bilansu mikroelementów.',
        priority: 'medium'
      }
    ];
    
    // Tutaj można by wywołać model AI dla bardziej spersonalizowanych przypomnień
    
    res.json({ reminders });
  } catch (error) {
    return handleError(error, res, 'Błąd generowania przypomnień');
  }
});

/**
 * Endpoint do generowania sugestii alternatywnych produktów
 */
router.post('/alternative-products', authenticateToken, async (req, res) => {
  try {
    const { product_name, meal_context } = req.body;
    
    if (!product_name) {
      return res.status(400).json({ error: 'Nazwa produktu jest wymagana' });
    }
    
    // Sprawdź, czy AI jest włączone
    const aiStatus = checkAiEnabled();
    if (!aiStatus.enabled) {
      return res.status(400).json({ 
        error: aiStatus.error, 
        message: aiStatus.message 
      });
    }
    
    // Tutaj można by wywołać model AI dla generowania alternatyw
    // Obecnie zwracamy mockowe dane
    
    let alternatives = [];
    const productLower = product_name.toLowerCase();
    
    if (productLower.includes('mięso') || productLower.includes('kurczak')) {
      alternatives = [
        {
          name: 'Tofu',
          benefits: 'Roślinne źródło białka, niższa zawartość tłuszczu',
          calories_diff: -30
        },
        {
          name: 'Tempeh',
          benefits: 'Fermentowane białko roślinne, dobre źródło probiotyków',
          calories_diff: -20
        },
        {
          name: 'Seitan',
          benefits: 'Wysokobiałkowy produkt z glutenu pszennego',
          calories_diff: -15
        }
      ];
    } else if (productLower.includes('ser') || productLower.includes('nabiał')) {
      alternatives = [
        {
          name: 'Ser z orzechów nerkowca',
          benefits: 'Bez laktozy, zdrowe tłuszcze',
          calories_diff: -10
        },
        {
          name: 'Wegański ser sojowy',
          benefits: 'Niższa zawartość tłuszczu nasyconego',
          calories_diff: -50
        },
        {
          name: 'Hummus',
          benefits: 'Źródło białka i błonnika, zdrowe tłuszcze',
          calories_diff: -20
        }
      ];
    } else if (productLower.includes('cukier') || productLower.includes('słodki')) {
      alternatives = [
        {
          name: 'Ksylitol',
          benefits: 'Naturalny słodzik o niskim indeksie glikemicznym',
          calories_diff: -40
        },
        {
          name: 'Syrop z daktyli',
          benefits: 'Naturalne źródło słodyczy z mikroelementami',
          calories_diff: -15
        },
        {
          name: 'Stevia',
          benefits: 'Słodzik bez kalorii',
          calories_diff: -100
        }
      ];
    } else {
      alternatives = [
        {
          name: 'Alternatywa 1',
          benefits: 'Zdrowsza opcja z niższą zawartością kalorii',
          calories_diff: -25
        },
        {
          name: 'Alternatywa 2',
          benefits: 'Więcej błonnika i mikroelementów',
          calories_diff: -15
        },
        {
          name: 'Alternatywa 3',
          benefits: 'Lepsza opcja dla osób na diecie',
          calories_diff: -30
        }
      ];
    }
    
    res.json({ 
      product: product_name,
      alternatives: alternatives
    });
  } catch (error) {
    return handleError(error, res, 'Błąd generowania alternatywnych produktów');
  }
});

module.exports = router;