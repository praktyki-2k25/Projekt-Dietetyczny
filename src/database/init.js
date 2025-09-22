const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Ścieżka do pliku bazy danych
const dbPath = path.resolve(process.env.DATABASE_PATH || './database.sqlite');

// Utworzenie połączenia z bazą danych
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Błąd podczas łączenia z bazą danych:', err.message);
  } else {
    console.log('Połączenie z bazą danych SQLite zostało nawiązane.');
    
    // Tworzenie tabeli users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      weight REAL,
      height REAL,
      age INTEGER,
      bmi REAL,
      weight_goal REAL,
      gender TEXT,
      activity_level TEXT DEFAULT 'moderate'
    )`, (err) => {
      if (err) {
        console.error('Błąd podczas tworzenia tabeli users:', err.message);
      } else {
        console.log('Tabela users została utworzona lub już istnieje.');

        // Dodanie przykładowego użytkownika dla testów
        const testUser = {
          email: 'test@example.com',
          password: bcrypt.hashSync('haslo123', 10),
          username: 'TestowyUżytkownik',
          weight: 80.5,
          height: 180,
          age: 30,
          bmi: 24.8,
          weight_goal: 75
        };

        db.get('SELECT id FROM users WHERE email = ?', [testUser.email], (err, user) => {
          if (err) {
            console.error('Błąd podczas sprawdzania istniejącego użytkownika:', err.message);
          } else if (!user) {
            // Dodaj użytkownika testowego jeśli nie istnieje
            db.run(`
              INSERT INTO users (email, password, username, weight, height, age, bmi, weight_goal)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              testUser.email,
              testUser.password,
              testUser.username,
              testUser.weight,
              testUser.height,
              testUser.age,
              testUser.bmi,
              testUser.weight_goal
            ], function(err) {
              if (err) {
                console.error('Błąd podczas dodawania użytkownika testowego:', err.message);
              } else {
                console.log('Dodano użytkownika testowego z ID:', this.lastID);
              }
              
              // Tworzenie tabeli meals po utworzeniu użytkownika
              createMealsTable();
            });
          } else {
            console.log('Użytkownik testowy już istnieje.');
            // Tworzenie tabeli meals jeśli użytkownik już istnieje
            createMealsTable();
          }
        });
      }
    });
  }
});

// Funkcja tworząca tabelę meals
function createMealsTable() {
  db.run(`CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    calories INTEGER,
    protein REAL,
    carbs REAL,
    fat REAL,
    meal_date DATE DEFAULT CURRENT_DATE,
    meal_type TEXT, /* breakfast, lunch, dinner, snack */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Błąd podczas tworzenia tabeli meals:', err.message);
    } else {
      console.log('Tabela meals została utworzona lub już istnieje.');
      
      // Dodaj przykładowe posiłki
      addExampleMeals();
    }
  });
}

// Funkcja dodająca przykładowe posiłki
function addExampleMeals() {
  db.get('SELECT id FROM users WHERE email = ?', ['test@example.com'], (err, user) => {
    if (err || !user) {
      console.error('Błąd podczas pobierania użytkownika testowego:', err ? err.message : 'Brak użytkownika');
      closeDbConnection();
      return;
    }
    
    const userId = user.id;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const exampleMeals = [
      {
        name: 'Jajecznica na maśle',
        description: 'Jajecznica z 3 jaj na maśle z pomidorami i szczypiorkiem',
        calories: 350,
        protein: 22,
        carbs: 5,
        fat: 28,
        meal_date: today,
        meal_type: 'breakfast'
      },
      {
        name: 'Kurczak z ryżem',
        description: 'Grillowana pierś z kurczaka z ryżem i warzywami',
        calories: 520,
        protein: 42,
        carbs: 45,
        fat: 12,
        meal_date: today,
        meal_type: 'lunch'
      },
      {
        name: 'Sałatka z tuńczykiem',
        description: 'Sałatka z tuńczykiem, jajkiem i warzywami',
        calories: 320,
        protein: 28,
        carbs: 10,
        fat: 18,
        meal_date: today,
        meal_type: 'dinner'
      },
      {
        name: 'Koktajl proteinowy',
        description: 'Koktajl proteinowy z bananem i masłem orzechowym',
        calories: 280,
        protein: 25,
        carbs: 25,
        fat: 8,
        meal_date: today,
        meal_type: 'snack'
      }
    ];
    
    let insertedCount = 0;
    const totalToInsert = exampleMeals.length;
    
    exampleMeals.forEach(meal => {
      db.run(`
        INSERT INTO meals (
          user_id, name, description, calories, protein, 
          carbs, fat, meal_date, meal_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        meal.name,
        meal.description,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        meal.meal_date,
        meal.meal_type
      ], function(err) {
        if (err) {
          console.error(`Błąd podczas dodawania posiłku ${meal.name}:`, err.message);
        } else {
          console.log(`Dodano posiłek ${meal.name} z ID:`, this.lastID);
        }
        
        insertedCount++;
        if (insertedCount === totalToInsert) {
          closeDbConnection();
        }
      });
    });
  });
}

// Zamknięcie połączenia z bazą danych
function closeDbConnection() {
  db.close((err) => {
    if (err) {
      console.error('Błąd podczas zamykania połączenia z bazą danych:', err.message);
    } else {
      console.log('Połączenie z bazą danych zostało zamknięte.');
    }
  });
}
