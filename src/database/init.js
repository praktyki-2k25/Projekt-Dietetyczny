const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { db, run, query, queryOne } = require('./connection');
require('dotenv').config();

async function initializeDatabase() {
  console.log('Inicjalizacja bazy danych...');
  
  try {
    // Tworzenie tabeli users
    await run(`CREATE TABLE IF NOT EXISTS users (
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
    )`);
    
    console.log('Tabela users utworzona');
    
    // Tworzenie tabeli meals
    await run(`CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fat REAL,
      meal_date DATE DEFAULT CURRENT_DATE,
      meal_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ai_analysis TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    
    console.log('Tabela meals utworzona');
    
    // Tworzenie tabeli ai_prompts
    await run(`CREATE TABLE IF NOT EXISTS ai_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      prompt_text TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('Tabela ai_prompts utworzona');
    
    await insertDefaultData();
    console.log('Inicjalizacja bazy danych zakończona');
    
    // Zamknij połączenie z bazą danych
    db.close((err) => {
      if (err) {
        console.error('Błąd podczas zamykania połączenia z bazą danych:', err.message);
      } else {
        console.log('Połączenie z bazą danych zostało zamknięte.');
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Błąd podczas inicjalizacji bazy danych:', error);
    process.exit(1);
  }
}

async function insertDefaultData() {
  try {
    // Dodanie testowego użytkownika
    const testPassword = bcrypt.hashSync('haslo123', 10);
    
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', ['test@example.com']);
    
    if (!existingUser) {
      await run(`
        INSERT INTO users (email, password, username, weight, height, age, bmi, weight_goal, gender)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'test@example.com',
        testPassword,
        'TestowyUżytkownik',
        80.5,
        180,
        30,
        24.8,
        75,
        'male'
      ]);
      console.log('Testowy użytkownik dodany');
    } else {
      console.log('Testowy użytkownik już istnieje');
    }
    
    // Dodanie przykładowych posiłków dla testowego użytkownika
    await addExampleMeals();
    
    // Dodanie domyślnych promptów AI
    const defaultPrompts = [
      {
        name: 'meal_analysis',
        prompt_text: `Przeanalizuj ten posiłek: {meal_name}, {meal_description}. 
Oszacuj jego wartości odżywcze (kalorie, białko, węglowodany, tłuszcz) 
i podaj krótką analizę pod kątem zdrowego odżywiania.`,
        description: 'Analizuje wartości odżywcze posiłku'
      },
      {
        name: 'diet_recommendations',
        prompt_text: `Na podstawie moich danych: waga {weight}kg, wzrost {height}cm, wiek {age}, 
oraz historii posiłków z ostatnich dni, zaproponuj plan dietetyczny na następny tydzień,
który pomoże osiągnąć moje cele zdrowotne.`,
        description: 'Generuje rekomendacje dietetyczne'
      },
      {
        name: 'health_insight',
        prompt_text: `Przeanalizuj moje nawyki żywieniowe z ostatnich {days} dni.
Wskaż mocne strony mojej diety oraz obszary, które można poprawić.`,
        description: 'Analizuje nawyki żywieniowe'
      }
    ];
    
    for (const prompt of defaultPrompts) {
      const existingPrompt = await queryOne('SELECT id FROM ai_prompts WHERE name = ?', [prompt.name]);
      
      if (!existingPrompt) {
        await run(
          'INSERT INTO ai_prompts (name, prompt_text, description) VALUES (?, ?, ?)',
          [prompt.name, prompt.prompt_text, prompt.description]
        );
        console.log(`Prompt "${prompt.name}" dodany`);
      } else {
        console.log(`Prompt "${prompt.name}" już istnieje`);
      }
    }
  } catch (error) {
    console.error('Błąd podczas dodawania danych domyślnych:', error);
    throw error;
  }
}

async function addExampleMeals() {
  try {
    const user = await queryOne('SELECT id FROM users WHERE email = ?', ['test@example.com']);
    
    if (!user) {
      throw new Error('Nie znaleziono testowego użytkownika');
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
    
    // Sprawdź czy posiłki już istnieją
    const existingMeals = await query('SELECT name FROM meals WHERE user_id = ?', [userId]);
    const existingMealNames = existingMeals.map(meal => meal.name);
    
    for (const meal of exampleMeals) {
      if (!existingMealNames.includes(meal.name)) {
        await run(`
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
        ]);
        
        console.log(`Dodano posiłek ${meal.name}`);
      } else {
        console.log(`Posiłek ${meal.name} już istnieje`);
      }
    }
  } catch (error) {
    console.error('Błąd podczas dodawania przykładowych posiłków:', error);
    throw error;
  }
}

// Uruchomienie inicjalizacji
initializeDatabase();