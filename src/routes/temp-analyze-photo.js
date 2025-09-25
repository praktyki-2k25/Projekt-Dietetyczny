/**
 * Endpoint do analizy zdjęcia posiłku
 */
router.post('/analyze-meal-photo', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Brak zdjęcia posiłku' });
    }
    
    if (process.env.AI_ENABLED !== 'true') {
      return res.status(400).json({ 
        error: 'Usługa AI nie jest włączona', 
        message: 'Ustaw AI_ENABLED=true w zmiennych środowiskowych'
      });
    }
    
    // Ścieżka do zapisanego zdjęcia
    const imagePath = req.file.path;
    console.log('Analizowanie zdjęcia z:', imagePath);
    
    try {
      // Analiza zdjęcia przez AI
      const analysis = await analyzeImage(imagePath);
      
      // Zwróć wynik analizy
      res.json({ 
        analysis,
        image_url: `/uploads/meals/${path.basename(imagePath)}`
      });
    } catch (aiError) {
      console.error('Błąd analizy zdjęcia:', aiError);
      
      // W przypadku błędu analizy zdjęcia, zwróć informację o błędzie
      res.status(500).json({ 
        error: 'Nie udało się przeanalizować zdjęcia', 
        message: aiError.message,
        details: 'Upewnij się, że zdjęcie jest wyraźne i przedstawia posiłek'
      });
    }
  } catch (error) {
    console.error('Błąd przetwarzania zdjęcia:', error);
    res.status(500).json({ error: error.message });
  }
});