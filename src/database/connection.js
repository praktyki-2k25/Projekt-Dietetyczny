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

/**
 * Funkcja do wykonywania zapytań SELECT (wiele wierszy)
 * @param {string} sql - Zapytanie SQL
 * @param {Array} params - Parametry zapytania
 * @returns {Promise<Array>} - Lista wyników
 */
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Błąd zapytania SQL:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Funkcja do wykonywania zapytań SELECT (jeden wiersz)
 * @param {string} sql - Zapytanie SQL
 * @param {Array} params - Parametry zapytania
 * @returns {Promise<Object>} - Pojedynczy wynik
 */
const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Błąd zapytania SQL:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Funkcja do wykonywania zapytań modyfikujących dane
 * @param {string} sql - Zapytanie SQL
 * @param {Array} params - Parametry zapytania
 * @returns {Promise<Object>} - Wynik operacji
 */
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Błąd zapytania SQL:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = { 
  db, 
  closeDatabase,
  query,
  queryOne,
  run
};