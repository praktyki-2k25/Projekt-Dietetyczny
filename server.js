const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, closeDatabase } = require('./src/database/connection');
const usersRoutes = require('./src/routes/users');
const mealsRoutes = require('./src/routes/meals');
const reportsRoutes = require('./src/routes/reports'); // Dodanie tras dla raportów
const { requestLogger } = require('./src/utils/logger');
const ConsoleInterface = require('./src/utils/console-interface');
const { router: statsRouter, statsMiddleware } = require('./src/utils/api-stats');
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
app.use(requestLogger); // Dodanie loggera żądań HTTP
app.use(statsMiddleware); // Dodanie middleware do zbierania statystyk

// Główna ścieżka
app.get('/', (req, res) => {
  res.json({ message: 'API aplikacji dietetycznej działa!' });
});

// Trasy
app.use('/api/users', usersRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/reports', reportsRoutes); // Dodanie tras dla raportów
app.use('/api/system', statsRouter); // Trasy dla statystyk systemu

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
  
  // Inicjalizacja interfejsu konsolowego
  const consoleInterface = new ConsoleInterface(app);
  consoleInterface.init(server);
});

// Obsługa zamknięcia serwera
const gracefulShutdown = () => {
  console.log('Zamykanie serwera...');
  server.close(() => {
    console.log('Serwer został zamknięty');
    closeDatabase();
    process.exit(0);
  });
};

// Obsługa sygnałów zamknięcia
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
