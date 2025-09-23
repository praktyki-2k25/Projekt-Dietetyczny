const { queryOne } = require('../database/connection');
require('dotenv').config();

/**
 * Punkt integracji z API modelu językowego (np. LangChain)
 * @param {Object} data - Dane posiłku do analizy
 * @returns {Promise<Object>} - Analiza AI
 */
async function getAiAnalysis(data) {
  // Sprawdzamy czy AI jest włączone
  if (process.env.AI_ENABLED !== 'true') {
    return null;
  }
  
  try {
    // W tym miejscu można zintegrować LangChain lub inny model językowy
    // Przykładowy kod dla integracji:
    /*
    const { ChatOpenAI } = require('@langchain/openai');
    const { PromptTemplate } = require('langchain/prompts');
    
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });
    
    const promptTemplate = PromptTemplate.fromTemplate(
      `Przeanalizuj ten posiłek: {name}. Opis: {description}. 
      Oceń jego wartości odżywcze i podaj szacunkowe kalorie, białko, węglowodany i tłuszcz.`
    );
    
    const promptInput = await promptTemplate.format({
      name: data.name,
      description: data.description || 'Brak opisu'
    });
    
    const response = await model.invoke(promptInput);
    
    // Tutaj można przetworzyć odpowiedź AI do odpowiedniego formatu
    */
    
    // Tymczasowo zwracamy mockowe dane odżywcze na podstawie nazwy posiłku
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    
    const name = data.name.toLowerCase();
    if (name.includes('jajecznica') || name.includes('jajka')) {
      calories = 350;
      protein = 22;
      carbs = 5;
      fat = 28;
    } else if (name.includes('kurczak') || name.includes('indyk')) {
      calories = 520;
      protein = 42;
      carbs = 45;
      fat = 12;
    } else if (name.includes('sałatka')) {
      calories = 320;
      protein = 28;
      carbs = 10;
      fat = 18;
    } else if (name.includes('koktajl') || name.includes('shake')) {
      calories = 280;
      protein = 25;
      carbs = 25;
      fat = 8;
    } else {
      calories = Math.floor(Math.random() * 500) + 100;
      protein = parseFloat((Math.random() * 30 + 5).toFixed(1));
      carbs = parseFloat((Math.random() * 50 + 10).toFixed(1));
      fat = parseFloat((Math.random() * 20 + 3).toFixed(1));
    }
    
    return {
      estimated_values: {
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat
      },
      health_analysis: `${data.name} to ${protein > 30 ? 'wysokobiałkowy' : protein > 15 ? 'średniobiałkowy' : 'niskobiałkowy'} posiłek z ${carbs > 30 ? 'dużą' : carbs > 15 ? 'umiarkowaną' : 'niską'} zawartością węglowodanów.`,
      suggestions: [
        protein < 20 ? "Rozważ dodanie więcej białka do tego posiłku" : "Zawartość białka jest odpowiednia",
        fat > 30 ? "Ten posiłek ma dość wysoką zawartość tłuszczu" : "Zawartość tłuszczu jest w normie",
        carbs < 20 ? "Możesz rozważyć dodanie więcej węglowodanów złożonych" : "Zawartość węglowodanów jest odpowiednia"
      ]
    };
  } catch (error) {
    console.error('Błąd podczas analizy AI:', error);
    throw new Error('Nie udało się przeprowadzić analizy AI');
  }
}

/**
 * Funkcja do generowania personalizowanych rekomendacji dietetycznych
 * @param {Object} userData - Dane użytkownika
 * @param {Array} mealHistory - Historia posiłków
 * @returns {Promise<Object>} - Rekomendacje AI
 */
async function getDietRecommendations(userData, mealHistory) {
  if (process.env.AI_ENABLED !== 'true') {
    return {
      recommendations: [
        "Funkcja AI nie jest aktywna. Włącz AI_ENABLED w zmiennych środowiskowych."
      ]
    };
  }

  try {
    // Tutaj integracja z modelem językowym do generowania rekomendacji
    // Na podstawie danych użytkownika i historii posiłków
    
    // Analiza historii posiłków
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const mealTypes = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    
    mealHistory.forEach(meal => {
      totalCalories += meal.calories || 0;
      totalProtein += meal.protein || 0;
      totalCarbs += meal.carbs || 0;
      totalFat += meal.fat || 0;
      mealTypes[meal.meal_type] = (mealTypes[meal.meal_type] || 0) + 1;
    });
    
    const avgCalories = mealHistory.length > 0 ? totalCalories / mealHistory.length : 0;
    const avgProtein = mealHistory.length > 0 ? totalProtein / mealHistory.length : 0;
    
    // Generowanie rekomendacji na podstawie analizy
    const recommendations = [];
    const mealSuggestions = [];
    
    if (mealHistory.length === 0) {
      recommendations.push("Brak historii posiłków. Zacznij dodawać posiłki, aby otrzymać spersonalizowane rekomendacje.");
    } else {
      // Rekomendacje oparte na wartościach odżywczych
      if (avgProtein < 20) {
        recommendations.push("Zwiększ spożycie białka w swojej diecie");
        mealSuggestions.push("Grillowana pierś z kurczaka z warzywami", "Omlet z 3 jajkami i warzywami");
      }
      
      if (userData.weight && userData.weight_goal && userData.weight > userData.weight_goal) {
        recommendations.push("Twój cel to utrata wagi. Ogranicz kalorie do około 1800-2000 dziennie.");
      } else if (userData.weight && userData.weight_goal && userData.weight < userData.weight_goal) {
        recommendations.push("Twój cel to przybranie na wadze. Zwiększ kalorie do około 2500-3000 dziennie.");
      }
      
      // Rekomendacje dotyczące regularności posiłków
      if (mealTypes.breakfast < mealHistory.length / 4) {
        recommendations.push("Staraj się jeść regularne śniadania - to ważny posiłek na początek dnia");
        mealSuggestions.push("Owsianka z owocami i orzechami", "Kanapki pełnoziarniste z jajkiem i warzywami");
      }
    }
    
    // Dodanie ogólnych rekomendacji
    if (recommendations.length === 0) {
      recommendations.push(
        "Twoja dieta wydaje się zrównoważona. Kontynuuj dobre nawyki żywieniowe!",
        "Pamiętaj o piciu wystarczającej ilości wody każdego dnia"
      );
    }
    
    // Dodanie ogólnych propozycji posiłków
    if (mealSuggestions.length === 0) {
      mealSuggestions.push(
        "Sałatka z łososiem i awokado",
        "Pieczona pierś z kurczaka z warzywami",
        "Koktajl proteinowy z bananem i masłem orzechowym"
      );
    }
    
    return {
      recommendations: recommendations,
      meal_suggestions: mealSuggestions
    };
  } catch (error) {
    console.error('Błąd podczas generowania rekomendacji:', error);
    throw new Error('Nie udało się wygenerować rekomendacji dietetycznych');
  }
}

/**
 * Funkcja do pobierania promptów dla modelu AI
 * @param {String} name - Nazwa promptu
 * @returns {Promise<String>} - Tekst promptu
 */
async function getPrompt(name) {
  try {
    const row = await queryOne('SELECT prompt_text FROM ai_prompts WHERE name = ?', [name]);
    
    if (!row) {
      throw new Error('Prompt nie znaleziony');
    }
    
    return row.prompt_text;
  } catch (error) {
    throw new Error(`Błąd podczas pobierania promptu: ${error.message}`);
  }
}

/**
 * Funkcja wypełniająca prompt danymi
 * @param {String} promptTemplate - Szablon promptu
 * @param {Object} variables - Zmienne do podstawienia
 * @returns {String} - Wypełniony prompt
 */
function fillPromptTemplate(promptTemplate, variables = {}) {
  let filledPrompt = promptTemplate;
  
  Object.keys(variables).forEach(key => {
    const placeholder = new RegExp(`{${key}}`, 'g');
    filledPrompt = filledPrompt.replace(placeholder, variables[key] || '');
  });
  
  return filledPrompt;
}

module.exports = {
  getAiAnalysis,
  getDietRecommendations,
  getPrompt,
  fillPromptTemplate
};