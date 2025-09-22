const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { db } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth'); // Importujemy middleware autoryzacji

// Inicjalizacja modelu użytkownika
const userModel = new User(db);

// Rejestracja nowego użytkownika
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, weight, height, age, weight_goal, gender } = req.body;
    
    // Walidacja pól
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Wymagane pola: email, hasło i nazwa użytkownika' });
    }
    
    // Sprawdzenie, czy użytkownik z takim email już istnieje
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Użytkownik z takim adresem email już istnieje' });
    }
    
    // Utworzenie nowego użytkownika
    const user = await userModel.create({
      email,
      password,
      username,
      weight,
      height,
      age,
      weight_goal,
      gender
    });
    
    // Generowanie tokenu JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      message: 'Użytkownik został zarejestrowany',
      user: { 
        id: user.id,
        email: user.email,
        username: user.username,
        bmi: user.bmi
      },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logowanie użytkownika
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Walidacja pól
    if (!email || !password) {
      return res.status(400).json({ error: 'Wymagane pola: email i hasło' });
    }
    
    // Weryfikacja danych logowania
    const user = await userModel.verifyCredentials(email, password);
    
    // Generowanie tokenu JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      message: 'Zalogowano pomyślnie',
      user: { 
        id: user.id,
        email: user.email,
        username: user.username,
        bmi: user.bmi
      },
      token 
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Pobranie profilu użytkownika
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizacja profilu użytkownika
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, weight, height, age, weight_goal, gender, activity_level } = req.body;
    
    // Aktualizacja danych użytkownika
    const updatedUser = await userModel.update(req.user.id, {
      username,
      weight,
      height,
      age,
      weight_goal,
      gender,
      activity_level
    });
    
    res.json({ 
      message: 'Profil został zaktualizowany',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Zmiana hasła
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    // Walidacja pól
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Wymagane pola: aktualne hasło i nowe hasło' });
    }
    
    // Zmiana hasła
    await userModel.changePassword(req.user.id, current_password, new_password);
    
    res.json({ message: 'Hasło zostało zmienione' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Usunięcie konta
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await userModel.delete(req.user.id);
    res.json({ message: 'Konto zostało usunięte' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wyszukiwanie użytkowników (do udostępniania posiłków)
router.get('/search', authenticateToken, async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Zapytanie wyszukiwania musi mieć co najmniej 3 znaki' });
  }
  
  try {
    db.all(`
      SELECT id, username, email 
      FROM users 
      WHERE (username LIKE ? OR email LIKE ?) AND id != ?
      LIMIT 10
    `, [`%${query}%`, `%${query}%`, req.user.id], (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Zwróć tylko podstawowe informacje o użytkownikach
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email
      }));
      
      res.json(safeUsers);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
