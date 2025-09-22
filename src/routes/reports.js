const express = require('express');
const router = express.Router();
const { db } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

// Generowanie raportu dziennego
router.get('/daily', authenticateToken, async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0]; // Domyślnie dzisiejsza data
  
  try {
    // Pobierz dane użytkownika
    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      
      // Pobierz wszystkie posiłki z danego dnia
      db.all('SELECT * FROM meals WHERE user_id = ? AND meal_date = ? ORDER BY meal_type', 
        [req.user.id, targetDate], 
        (err, meals) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Oblicz sumę makroskładników
          const summary = {
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0,
            meals_count: meals.length,
            date: targetDate,
            meals_by_type: {
              breakfast: [],
              lunch: [],
              dinner: [],
              snack: [],
              other: []
            }
          };
          
          meals.forEach(meal => {
            // Dodaj wartości odżywcze
            summary.total_calories += meal.calories || 0;
            summary.total_protein += meal.protein || 0;
            summary.total_carbs += meal.carbs || 0;
            summary.total_fat += meal.fat || 0;
            
            // Grupuj posiłki według typu
            const type = meal.meal_type || 'other';
            if (summary.meals_by_type[type]) {
              summary.meals_by_type[type].push(meal);
            } else {
              summary.meals_by_type.other.push(meal);
            }
          });
          
          // Zaokrąglij wartości
          summary.total_protein = parseFloat(summary.total_protein.toFixed(1));
          summary.total_carbs = parseFloat(summary.total_carbs.toFixed(1));
          summary.total_fat = parseFloat(summary.total_fat.toFixed(1));
          
          // Dodaj przybliżone dzienne zapotrzebowanie użytkownika
          // Bazuje na podstawowych wzorach (uproszczona wersja)
          let bmr = 0;
          if (user.gender === 'male') {
            // Wzór Harrisa-Benedicta dla mężczyzn
            bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
          } else {
            // Wzór Harrisa-Benedicta dla kobiet
            bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
          }
          
          // Mnożnik aktywności (domyślnie umiarkowana aktywność)
          const activityMultiplier = 1.55;
          const dailyCalories = Math.round(bmr * activityMultiplier);
          
          // Jeśli brak danych użytkownika, użyj domyślnych wartości
          summary.daily_goals = {
            calories: user.weight ? dailyCalories : 2000,
            protein: Math.round((dailyCalories * 0.15) / 4), // 15% kalorii z białka
            carbs: Math.round((dailyCalories * 0.50) / 4), // 50% kalorii z węglowodanów
            fat: Math.round((dailyCalories * 0.30) / 9) // 30% kalorii z tłuszczów
          };
          
          summary.percent_of_daily = {
            calories: Math.round((summary.total_calories / summary.daily_goals.calories) * 100),
            protein: Math.round((summary.total_protein / summary.daily_goals.protein) * 100),
            carbs: Math.round((summary.total_carbs / summary.daily_goals.carbs) * 100),
            fat: Math.round((summary.total_fat / summary.daily_goals.fat) * 100)
          };
          
          // Dodaj dane użytkownika do raportu (bez hasła)
          summary.user = {
            username: user.username,
            weight: user.weight,
            height: user.height,
            age: user.age,
            bmi: user.bmi,
            weight_goal: user.weight_goal
          };
          
          // Dodaj sugestie
          summary.suggestions = generateSuggestions(summary);
          
          res.json(summary);
      });
    });
  } catch (error) {
    console.error('Błąd podczas generowania raportu dziennego:', error);
    res.status(500).json({ error: 'Nie udało się wygenerować raportu', message: error.message });
  }
});

// Generowanie raportu tygodniowego
router.get('/weekly', authenticateToken, async (req, res) => {
  const { endDate } = req.query;
  const today = endDate ? new Date(endDate) : new Date();
  
  // Oblicz datę początkową (7 dni wstecz)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6); // 7 dni łącznie z dzisiejszym
  
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = today.toISOString().split('T')[0];
  
  try {
    // Pobierz dane użytkownika
    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      
      // Pobierz wszystkie posiłki z zakresu dat
      db.all('SELECT * FROM meals WHERE user_id = ? AND meal_date BETWEEN ? AND ? ORDER BY meal_date, meal_type', 
        [req.user.id, formattedStartDate, formattedEndDate], 
        (err, meals) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Przygotuj podsumowanie tygodniowe
          const weeklyReport = {
            user: {
              username: user.username,
              weight: user.weight,
              height: user.height,
              age: user.age,
              bmi: user.bmi,
              weight_goal: user.weight_goal
            },
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            total_meals: meals.length,
            days: {},
            summary: {
              calories: {
                total: 0,
                avg: 0,
                min: 0,
                max: 0
              },
              protein: {
                total: 0,
                avg: 0,
                min: 0,
                max: 0
              },
              carbs: {
                total: 0,
                avg: 0,
                min: 0,
                max: 0
              },
              fat: {
                total: 0,
                avg: 0,
                min: 0,
                max: 0
              }
            },
            meal_types_frequency: {
              breakfast: 0,
              lunch: 0,
              dinner: 0,
              snack: 0,
              other: 0
            }
          };
          
          // Grupuj posiłki według dni
          const mealsByDay = {};
          meals.forEach(meal => {
            // Inicjalizuj dzień, jeśli nie istnieje
            if (!mealsByDay[meal.meal_date]) {
              mealsByDay[meal.meal_date] = [];
            }
            
            mealsByDay[meal.meal_date].push(meal);
            
            // Licznik typów posiłków
            const type = meal.meal_type || 'other';
            if (weeklyReport.meal_types_frequency[type] !== undefined) {
              weeklyReport.meal_types_frequency[type]++;
            } else {
              weeklyReport.meal_types_frequency.other++;
            }
          });
          
          // Oblicz podsumowania dla każdego dnia
          const dailySummaries = [];
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const formattedDate = date.toISOString().split('T')[0];
            const dayMeals = mealsByDay[formattedDate] || [];
            
            const dayCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
            const dayProtein = dayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
            const dayCarbs = dayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
            const dayFat = dayMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
            
            const daySummary = {
              date: formattedDate,
              meals_count: dayMeals.length,
              calories: Math.round(dayCalories),
              protein: parseFloat(dayProtein.toFixed(1)),
              carbs: parseFloat(dayCarbs.toFixed(1)),
              fat: parseFloat(dayFat.toFixed(1)),
              meals: dayMeals
            };
            
            weeklyReport.days[formattedDate] = daySummary;
            dailySummaries.push(daySummary);
            
            // Dodaj do sumy tygodniowej
            weeklyReport.summary.calories.total += dayCalories;
            weeklyReport.summary.protein.total += dayProtein;
            weeklyReport.summary.carbs.total += dayCarbs;
            weeklyReport.summary.fat.total += dayFat;
          }
          
          // Oblicz min, max i średnie
          if (dailySummaries.length > 0) {
            // Kalorie
            weeklyReport.summary.calories.avg = Math.round(weeklyReport.summary.calories.total / 7);
            weeklyReport.summary.calories.min = Math.min(...dailySummaries.map(d => d.calories));
            weeklyReport.summary.calories.max = Math.max(...dailySummaries.map(d => d.calories));
            
            // Białko
            weeklyReport.summary.protein.avg = parseFloat((weeklyReport.summary.protein.total / 7).toFixed(1));
            weeklyReport.summary.protein.min = Math.min(...dailySummaries.map(d => d.protein));
            weeklyReport.summary.protein.max = Math.max(...dailySummaries.map(d => d.protein));
            
            // Węglowodany
            weeklyReport.summary.carbs.avg = parseFloat((weeklyReport.summary.carbs.total / 7).toFixed(1));
            weeklyReport.summary.carbs.min = Math.min(...dailySummaries.map(d => d.carbs));
            weeklyReport.summary.carbs.max = Math.max(...dailySummaries.map(d => d.carbs));
            
            // Tłuszcze
            weeklyReport.summary.fat.avg = parseFloat((weeklyReport.summary.fat.total / 7).toFixed(1));
            weeklyReport.summary.fat.min = Math.min(...dailySummaries.map(d => d.fat));
            weeklyReport.summary.fat.max = Math.max(...dailySummaries.map(d => d.fat));
          }
          
          // Dodaj sugestie i trendy
          weeklyReport.trends = analyzeTrends(weeklyReport);
          weeklyReport.suggestions = generateWeeklySuggestions(weeklyReport);
          
          res.json(weeklyReport);
      });
    });
  } catch (error) {
    console.error('Błąd podczas generowania raportu tygodniowego:', error);
    res.status(500).json({ error: 'Nie udało się wygenerować raportu', message: error.message });
  }
});

// Funkcja do generowania sugestii dla raportu dziennego
function generateSuggestions(summary) {
  const suggestions = [];
  
  // Sprawdź kalorie
  if (summary.percent_of_daily.calories < 70) {
    suggestions.push('Spożywasz mniej kalorii niż zalecane dzienne zapotrzebowanie. Upewnij się, że dostarczasz wystarczającą ilość energii.');
  } else if (summary.percent_of_daily.calories > 120) {
    suggestions.push('Spożywasz więcej kalorii niż zalecane dzienne zapotrzebowanie. Rozważ zmniejszenie wielkości porcji.');
  }
  
  // Sprawdź białko
  if (summary.percent_of_daily.protein < 80) {
    suggestions.push('Twoja dieta zawiera mało białka. Rozważ dodanie mięsa, ryb, jajek, nabiału lub roślin strączkowych.');
  } else if (summary.percent_of_daily.protein > 150) {
    suggestions.push('Spożywasz dużo białka. Nadmiar białka może obciążać nerki. Upewnij się, że pijesz wystarczająco dużo wody.');
  }
  
  // Sprawdź węglowodany
  if (summary.percent_of_daily.carbs < 70) {
    suggestions.push('Twoja dieta zawiera mało węglowodanów. Węglowodany są głównym źródłem energii dla organizmu.');
  } else if (summary.percent_of_daily.carbs > 130) {
    suggestions.push('Spożywasz dużo węglowodanów. Rozważ zastąpienie części węglowodanów prostych (cukry) węglowodanami złożonymi (pełnoziarniste produkty).');
  }
  
  // Sprawdź tłuszcze
  if (summary.percent_of_daily.fat < 70) {
    suggestions.push('Twoja dieta zawiera mało tłuszczu. Tłuszcze są ważne dla prawidłowego funkcjonowania organizmu i wchłaniania witamin rozpuszczalnych w tłuszczach.');
  } else if (summary.percent_of_daily.fat > 130) {
    suggestions.push('Spożywasz dużo tłuszczu. Zwróć uwagę na źródła zdrowych tłuszczów, takie jak orzechy, awokado i oliwa z oliwek.');
  }
  
  // Sprawdź rozkład posiłków
  if (!summary.meals_by_type.breakfast || summary.meals_by_type.breakfast.length === 0) {
    suggestions.push('Nie zjedliście śniadania. Śniadanie jest ważnym posiłkiem, który dostarcza energii na początek dnia.');
  }
  
  if ((summary.meals_by_type.breakfast.length + summary.meals_by_type.lunch.length + 
       summary.meals_by_type.dinner.length + summary.meals_by_type.snack.length) < 3) {
    suggestions.push('Jadasz mało posiłków w ciągu dnia. Spróbuj jeść 3-5 mniejszych posiłków zamiast 1-2 dużych.');
  }
  
  return suggestions;
}

// Funkcja do analizy trendów w raporcie tygodniowym
function analyzeTrends(weeklyReport) {
  const trends = {
    calorie_trend: 'stable',
    protein_trend: 'stable',
    carbs_trend: 'stable',
    fat_trend: 'stable',
    meal_consistency: 'good'
  };
  
  // Analiza trendu kalorycznego
  const caloriesVariation = (weeklyReport.summary.calories.max - weeklyReport.summary.calories.min) / weeklyReport.summary.calories.avg;
  if (caloriesVariation > 0.4) {
    trends.calorie_trend = 'inconsistent';
  } else if (caloriesVariation < 0.2) {
    trends.calorie_trend = 'very_stable';
  }
  
  // Analiza liczby posiłków dziennie
  let daysMissingMeals = 0;
  Object.values(weeklyReport.days).forEach(day => {
    if (day.meals_count < 3) {
      daysMissingMeals++;
    }
  });
  
  if (daysMissingMeals > 3) {
    trends.meal_consistency = 'poor';
  } else if (daysMissingMeals > 1) {
    trends.meal_consistency = 'moderate';
  }
  
  return trends;
}

// Funkcja do generowania sugestii dla raportu tygodniowego
function generateWeeklySuggestions(weeklyReport) {
  const suggestions = [];
  
  // Sprawdź trendy
  if (weeklyReport.trends.calorie_trend === 'inconsistent') {
    suggestions.push('Twoje spożycie kalorii jest bardzo zróżnicowane w ciągu tygodnia. Spróbuj utrzymać bardziej regularne nawyki żywieniowe.');
  }
  
  if (weeklyReport.trends.meal_consistency === 'poor') {
    suggestions.push('W wielu dniach jesz mniej niż 3 posiłki. Regularny rozkład posiłków pomaga utrzymać stały poziom energii i zapobiega przejadaniu się.');
  }
  
  // Sprawdź średnie spożycie
  const avgCaloriesPercent = weeklyReport.summary.calories.avg / 2000 * 100; // Przyjmujemy 2000 kcal jako punkt odniesienia
  
  if (avgCaloriesPercent < 80) {
    suggestions.push('Twoje średnie dzienne spożycie kalorii jest niskie. Upewnij się, że dostarczasz wystarczającą ilość energii dla swojego organizmu.');
  } else if (avgCaloriesPercent > 120) {
    suggestions.push('Twoje średnie dzienne spożycie kalorii jest wysokie. Jeśli chcesz schudnąć, rozważ zmniejszenie wielkości porcji lub wybór mniej kalorycznych potraw.');
  }
  
  // Sprawdź równowagę makroskładników
  const totalCalories = weeklyReport.summary.calories.total;
  const proteinCalories = weeklyReport.summary.protein.total * 4;
  const carbsCalories = weeklyReport.summary.carbs.total * 4;
  const fatCalories = weeklyReport.summary.fat.total * 9;
  
  const proteinPercent = (proteinCalories / totalCalories) * 100;
  const carbsPercent = (carbsCalories / totalCalories) * 100;
  const fatPercent = (fatCalories / totalCalories) * 100;
  
  if (proteinPercent < 10) {
    suggestions.push('Twoja dieta zawiera mało białka. Białko jest ważne dla budowy i regeneracji mięśni. Rozważ dodanie większej ilości mięsa, ryb, jajek, nabiału lub roślin strączkowych.');
  }
  
  if (carbsPercent > 65) {
    suggestions.push('Twoja dieta zawiera dużo węglowodanów. Rozważ zastąpienie części węglowodanów prostych (cukry) węglowodanami złożonymi (pełnoziarniste produkty).');
  }
  
  if (fatPercent < 15) {
    suggestions.push('Twoja dieta zawiera mało tłuszczu. Tłuszcze są ważne dla prawidłowego funkcjonowania organizmu i wchłaniania witamin rozpuszczalnych w tłuszczach.');
  } else if (fatPercent > 40) {
    suggestions.push('Twoja dieta zawiera dużo tłuszczu. Zwróć uwagę na źródła zdrowych tłuszczów, takie jak orzechy, awokado i oliwa z oliwek.');
  }
  
  // Dodaj ogólne sugestie, jeśli lista jest pusta
  if (suggestions.length === 0) {
    suggestions.push('Twoja dieta wygląda dobrze i jest dobrze zbilansowana. Kontynuuj dobre nawyki żywieniowe!');
  }
  
  return suggestions;
}

module.exports = router;
