const { queryOne } = require('../database/connection');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

// Adres serwisu AI
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Punkt integracji z API modelu językowego poprzez serwis AI
 * @param {Object} data - Dane posiłku do analizy
 * @returns {Promise<Object>} - Analiza AI
 */
async function getAiAnalysis(data) {
  // Sprawdzamy czy AI jest włączone
  if (process.env.AI_ENABLED !== 'true') {
    throw new Error('Funkcja analizy AI nie jest aktywna. Włącz AI_ENABLED w zmiennych środowiskowych.');
  }
  
  try {
    // Próbujemy połączyć się z serwisem AI
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-meal`, {
      name: data.name,
      description: data.description || 'Brak opisu'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 sekund timeout
    });
    
    if (response.status === 200 && response.data) {
      console.log("Odpowiedź z AI:", JSON.stringify(response.data, null, 2));
      return response.data;
    } else {
      throw new Error('Nieprawidłowa odpowiedź z serwisu AI');
    }
  } catch (error) {
    console.error('Błąd podczas analizy AI:', error.message);
    if (error.response) {
      console.error('Dane odpowiedzi:', error.response.data);
      console.error('Status:', error.response.status);
    }
    // Przekaż błąd dalej
    throw error;
  }
}

/**
 * Funkcja do analizy zdjęcia posiłku
 * @param {String} imagePath - Ścieżka do pliku zdjęcia
 * @returns {Promise<Object>} - Wynik analizy
 */
async function analyzeImage(imagePath) {
  // Sprawdzamy czy AI jest włączone
  if (process.env.AI_ENABLED !== 'true') {
    throw new Error('Funkcja analizy AI nie jest aktywna. Włącz AI_ENABLED w zmiennych środowiskowych.');
  }
  
  try {
  // Przygotowanie formularza z plikiem
  const formData = new FormData();
  // Uwaga: plik musi być dodany jako 'file', a nie 'image'
  formData.append('file', fs.createReadStream(imagePath));
  
  console.log('===================================');
  console.log('Wysyłanie zdjęcia do analizy AI...');
  console.log('URL:', `${AI_SERVICE_URL}/analyze-meal-photo`);
  console.log('Plik:', imagePath);
      console.log('Istnieje:', fs.existsSync(imagePath) ? 'Tak' : 'Nie');
    
    try {
      // Wysyłanie żądania do serwisu AI
      const response = await axios.post(`${AI_SERVICE_URL}/analyze-meal-photo`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 60000 // 60 sekund timeout - analiza obrazu może trwać dłużej
      });
      
      console.log('Otrzymano odpowiedź z serwisu AI:', JSON.stringify(response.data, null, 2));
      
      // Sprawdź czy odpowiedź zawiera błąd
      if (response.data.error) {
        console.error('Błąd zwrócony przez AI:', response.data.error);
        throw new Error(response.data.error + (response.data.details ? `: ${response.data.details}` : ''));
      }
      
      // Sprawdź czy odpowiedź ma prawidłową strukturę
      if (!response.data.meal_name || !response.data.estimated_values) {
        console.error('Nieprawidłowa struktura odpowiedzi:', JSON.stringify(response.data, null, 2));
        throw new Error('Otrzymano nieprawidłowy format odpowiedzi z serwisu AI');
      }
      
      console.log('Pomyślnie przeanalizowano zdjęcie, zwracam wynik.');
      console.log('===================================');
      return response.data;
    } catch (axiosError) {
      // Sprawdź szczegóły błędu Axios
      console.error('Błąd Axios podczas żądania:', axiosError.message);
      if (axiosError.response) {
        console.error('Status odpowiedzi:', axiosError.response.status);
        console.error('Dane odpowiedzi:', JSON.stringify(axiosError.response.data, null, 2));
      }
      if (axiosError.request) {
        console.error('Nie otrzymano odpowiedzi:', axiosError.request);
      }
      throw axiosError;
    }
  } catch (error) {
    console.error('Błąd podczas analizy zdjęcia:', error.message);
    console.log('===================================');
    // Przekaż błąd dalej
    throw error;
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
    throw new Error('Funkcja analizy AI nie jest aktywna. Włącz AI_ENABLED w zmiennych środowiskowych.');
  }

  try {
    // Próbujemy połączyć się z serwisem AI
    const response = await axios.post(`${AI_SERVICE_URL}/recommendations`, {
      user_data: userData,
      meal_history: mealHistory
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 sekund timeout
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Nieprawidłowa odpowiedź z serwisu AI dla rekomendacji');
    }
  } catch (error) {
    console.error('Błąd podczas generowania rekomendacji:', error.message);
    throw error;
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

/**
 * Funkcja do prostego opisu zdjęcia posiłku
 * @param {String} imagePath - Ścieżka do pliku zdjęcia
 * @returns {Promise<String>} - Tekstowy opis posiłku
 */
async function getImageDescription(imagePath) {
  // Sprawdzamy czy AI jest włączone
  if (process.env.AI_ENABLED !== 'true') {
    throw new Error('Funkcja analizy zdjęcia jest niedostępna. Włącz AI_ENABLED w zmiennych środowiskowych.');
  }
  
  try {
    // Przygotowanie formularza z plikiem
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    // Wysłanie żądania do serwisu AI
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-image-description`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000 // 30 sekund timeout - analiza obrazu może trwać dłużej
    });
    
    if (response.status === 200 && response.data && response.data.description) {
      return response.data.description;
    } else {
      throw new Error('Nieprawidłowa odpowiedź z serwisu AI');
    }
  } catch (error) {
    console.error('Błąd podczas analizy opisu zdjęcia:', error.message);
    throw error;
  }
}

module.exports = {
  getAiAnalysis,
  analyzeImage,
  getImageDescription,
  getDietRecommendations,
  getPrompt,
  fillPromptTemplate
};