const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Ścieżka do pliku bazy danych
const dbPath = path.resolve(process.env.DATABASE_PATH || './database.sqlite');

// Utworzenie połączenia z bazą danych
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Błąd podczas łączenia z bazą danych:', err.message);
  } else {
    console.log('Połączenie z bazą danych SQLite zostało nawiązane.');
  }
});

// Funkcja do zamknięcia połączenia, używana przy zamykaniu aplikacji
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('Błąd podczas zamykania połączenia z bazą danych:', err.message);
    } else {
      console.log('Połączenie z bazą danych zostało zamknięte.');
    }
  });
};

module.exports = { db, closeDatabase };
