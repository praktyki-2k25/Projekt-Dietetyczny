// Test integracji z AI dla aplikacji dietetycznej
const fetch = require('node-fetch');
const readline = require('readline');

// Konfiguracja
const API_URL = 'http://localhost:3000';
let authToken = '';

// Interfejs do wczytywania danych z konsoli
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funkcja pomocnicza do wysyłania żądań do API
async function callApi(endpoint, method, data, withAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (withAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options = {
    method: method,
    headers: headers,
    body: data ? JSON.stringify(data) : undefined
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('Błąd podczas wywoływania API:', error);
    return {
      status: 500,
      data: { error: error.message }
    };
  }
}

// Funkcja logowania
async function login() {
  console.log('\n--- Logowanie ---\n');
  
  const email = 'test@example.com';
  const password = 'haslo123';
  
  console.log(`Loguję jako ${email}...`);
  
  const response = await callApi('/api/users/login', 'POST', { 
    email,
    password
  }, false);
  
  if (response.status === 200 && response.data.token) {
    authToken = response.data.token;
    console.log('Zalogowano pomyślnie!');
    console.log('Token:', authToken);
    return true;
  } else {
    console.error('Błąd logowania:', response.data.error || 'Nieznany błąd');
    return false;
  }
}

// Funkcja do analizy posiłku przez AI
async function analyzeMeal(mealData) {
  console.log('\n--- Analiza posiłku przez AI ---\n');
  
  console.log('Dane posiłku:');
  console.log(mealData);
  
  const response = await callApi('/api/meals/analyze', 'POST', mealData);
  
  console.log('\nWynik analizy:');
  if (response.status === 200) {
    printAnalysisResults(response.data);
    return response.data;
  } else {
    console.error('Błąd analizy:', response.data.error || 'Nieznany błąd');
    return null;
  }
}

// Funkcja do dodawania posiłku z analizą AI
async function addMealWithAnalysis(mealData) {
  console.log('\n--- Dodawanie posiłku z analizą AI ---\n');
  
  console.log('Dane posiłku:');
  console.log(mealData);
  
  const response = await callApi('/api/meals/with-analysis', 'POST', mealData);
  
  console.log('\nWynik dodawania:');
  if (response.status === 201) {
    console.log('Posiłek został dodany!');
    console.log('ID posiłku:', response.data.meal.id);
    
    if (response.data.ai_analysis) {
      console.log('\nAnaliza AI:');
      printAnalysisResults(response.data.ai_analysis);
    }
    
    return response.data;
  } else {
    console.error('Błąd dodawania:', response.data.error || 'Nieznany błąd');
    return null;
  }
}

// Funkcja do pobierania dziennego podsumowania
async function getDailySummary(date = null) {
  console.log('\n--- Podsumowanie dzienne ---\n');
  
  const endpoint = date ? `/api/meals/summary/daily?date=${date}` : '/api/meals/summary/daily';
  
  const response = await callApi(endpoint, 'GET');
  
  if (response.status === 200) {
    console.log('Data:', response.data.date);
    console.log('Liczba posiłków:', response.data.meals_count);
    console.log('\nWartości odżywcze:');
    console.log(`Kalorie: ${response.data.total_calories} kcal (${response.data.percent_of_daily.calories}% dziennego zapotrzebowania)`);
    console.log(`Białko: ${response.data.total_protein}g (${response.data.percent_of_daily.protein}%)`);
    console.log(`Węglowodany: ${response.data.total_carbs}g (${response.data.percent_of_daily.carbs}%)`);
    console.log(`Tłuszcze: ${response.data.total_fat}g (${response.data.percent_of_daily.fat}%)`);
    
    console.log('\nPosiłki według typu:');
    Object.keys(response.data.meals_by_type).forEach(type => {
      const meals = response.data.meals_by_type[type];
      if (meals.length > 0) {
        console.log(`\n${type.toUpperCase()} (${meals.length}):`);
        meals.forEach(meal => {
          console.log(`- ${meal.name} (${meal.calories || 0} kcal)`);
        });
      }
    });
    
    return response.data;
  } else {
    console.error('Błąd pobierania podsumowania:', response.data.error || 'Nieznany błąd');
    return null;
  }
}

// Funkcja pomocnicza do wyświetlania wyników analizy
function printAnalysisResults(analysis) {
  console.log('Nazwa posiłku:', analysis.meal_name);
  
  console.log('\nWartości odżywcze:');
  console.log(`Kalorie: ${analysis.estimated_values.calories} kcal`);
  console.log(`Białko: ${analysis.estimated_values.protein}g`);
  console.log(`Węglowodany: ${analysis.estimated_values.carbs}g`);
  console.log(`Tłuszcze: ${analysis.estimated_values.fat}g`);
  
  if (analysis.allergens && analysis.allergens.length > 0) {
    console.log('\nWykryte alergeny:', analysis.allergens.join(', '));
  }
  
  if (analysis.suggestions && analysis.suggestions.length > 0) {
    console.log('\nSugestie:');
    analysis.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion}`);
    });
  }
  
  if (analysis.health_score) {
    console.log(`\nOcena zdrowotna: ${analysis.health_score}/10`);
  }
}

// Funkcja wyświetlająca menu
function showMenu() {
  console.log('\n------ MENU TESTOWE AI ------\n');
  console.log('1. Zaloguj się');
  console.log('2. Analizuj posiłek');
  console.log('3. Dodaj posiłek z analizą');
  console.log('4. Pobierz dzienne podsumowanie');
  console.log('0. Wyjście');
  console.log('\n-----------------------------\n');
  
  rl.question('Wybierz opcję: ', async (option) => {
    switch (option) {
      case '1':
        await login();
        break;
      case '2':
        if (!authToken) {
          console.log('Musisz najpierw się zalogować!');
          break;
        }
        
        rl.question('Nazwa posiłku: ', (name) => {
          rl.question('Składniki: ', (ingredients) => {
            rl.question('Typ posiłku (breakfast/lunch/dinner/snack): ', async (mealType) => {
              await analyzeMeal({
                name,
                ingredients,
                meal_type: mealType
              });
              showMenu();
            });
          });
        });
        return;
      case '3':
        if (!authToken) {
          console.log('Musisz najpierw się zalogować!');
          break;
        }
        
        rl.question('Nazwa posiłku: ', (name) => {
          rl.question('Opis: ', (description) => {
            rl.question('Składniki: ', (ingredients) => {
              rl.question('Typ posiłku (breakfast/lunch/dinner/snack): ', async (mealType) => {
                await addMealWithAnalysis({
                  name,
                  description,
                  ingredients,
                  meal_type: mealType
                });
                showMenu();
              });
            });
          });
        });
        return;
      case '4':
        if (!authToken) {
          console.log('Musisz najpierw się zalogować!');
          break;
        }
        
        rl.question('Data (YYYY-MM-DD, pusty=dzisiaj): ', async (date) => {
          await getDailySummary(date || null);
          showMenu();
        });
        return;
      case '0':
        console.log('Do widzenia!');
        rl.close();
        return;
      default:
        console.log('Nieprawidłowa opcja!');
    }
    
    showMenu();
  });
}

// Funkcja startowa
async function main() {
  console.log('\n==== Test integracji z AI ====\n');
  console.log('Ten skrypt testuje integrację z AI dla aplikacji dietetycznej.');
  
  showMenu();
}

// Uruchomienie programu
main().catch(error => {
  console.error('Błąd:', error);
});
