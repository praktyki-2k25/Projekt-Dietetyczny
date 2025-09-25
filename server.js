const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./src/database/connection');
const usersRoutes = require('./src/routes/users');
const mealsRoutes = require('./src/routes/meals');
const reportsRoutes = require('./src/routes/reports');
const aiRoutes = require('./src/routes/ai');
const { requestLogger } = require('./src/utils/logger');
require('dotenv').config();

// Czyszczenie konsoli przy starcie
console.clear();

// Inicjalizacja aplikacji Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Logger żądań HTTP

// Główna ścieżka
app.get('/', (req, res) => {
  res.json({ 
    message: 'API aplikacji dietetycznej działa!',
    ai_enabled: process.env.AI_ENABLED === 'true' 
  });
});

// Trasy API
app.use('/api/users', usersRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/meals', require('./src/routes/meal-analysis'));
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes); // Nowe trasy AI

// Obsługa błędów 404
app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono' });
});

// Obsługa globalnych błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Wystąpił błąd serwera' });
});

// Uruchomienie serwera
const server = app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log(`AI ${process.env.AI_ENABLED === 'true' ? 'włączone' : 'wyłączone'}`);
});

// Obsługa zamknięcia serwera
const gracefulShutdown = () => {
  console.log('Zamykanie serwera...');
  server.close(() => {
    console.log('Serwer został zamknięty');
    process.exit(0);
  });
};

// Obsługa sygnałów zamknięcia
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;