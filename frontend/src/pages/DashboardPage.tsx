import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mealsApi } from '@/lib/api';
import { DailySummary } from '@/types';
import { Card, LoadingSpinner } from '@/components/ui';
import { 
  Calendar, 
  TrendingUp, 
  Utensils, 
  Target, 
  Activity,
  Plus
} from 'lucide-react';
import { 
  formatDate, 
  formatDateInput, 
  getMealTypeLabel,
  getMealTypeColor,
  getBMICategory,
  getBMIColor,
  calculateDailyCalories,
  formatNumber
} from '@/lib/utils';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        setIsLoading(true);
        const summary = await mealsApi.getDailySummary(selectedDate);
        setDailySummary(summary);
      } catch (error) {
        console.error('Failed to fetch daily summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailySummary();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const macronutrientData = dailySummary ? [
    { name: 'Białka', value: dailySummary.total_protein, color: '#22c55e' },
    { name: 'Węglowodany', value: dailySummary.total_carbs, color: '#3b82f6' },
    { name: 'Tłuszcze', value: dailySummary.total_fat, color: '#f59e0b' },
  ] : [];

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
  const mealData = mealTypes.map(type => ({
    name: getMealTypeLabel(type),
    calories: dailySummary?.meals_by_type[type].reduce((sum, meal) => sum + meal.calories, 0) || 0,
  }));

  const dailyCalories = user?.weight && user?.height && user?.age && user?.gender && user?.activity_level 
    ? calculateDailyCalories(user.weight, user.height, user.age, user.gender, user.activity_level)
    : dailySummary?.daily_goals.calories || 2000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard - Witaj, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Przegląd Twoich dzisiejszych posiłków i postępów
        </p>
      </div>

      {/* Date selector */}
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Wybierz datę:
              </label>
            </div>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input w-auto"
            />
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Kalorie</h3>
              <p className="text-2xl font-bold text-primary-600">
                {formatNumber(dailySummary?.total_calories || 0, 0)}
              </p>
              <p className="text-sm text-gray-500">
                z {formatNumber(dailyCalories, 0)} dziennego celu
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Postęp</span>
              <span>{dailySummary ? Math.round((dailySummary.total_calories / dailyCalories) * 100) : 0}%</span>
            </div>
            <div className="mt-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, dailySummary ? (dailySummary.total_calories / dailyCalories) * 100 : 0)}%`
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Posiłki</h3>
              <p className="text-2xl font-bold text-blue-600">
                {dailySummary?.meals_count || 0}
              </p>
              <p className="text-sm text-gray-500">dzisiaj</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Białko</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(dailySummary?.total_protein || 0, 1)}g
              </p>
              <p className="text-sm text-gray-500">
                {dailySummary ? Math.round(dailySummary.percent_of_daily.protein) : 0}% celu
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">BMI</h3>
              <p className={`text-2xl font-bold ${getBMIColor(user?.bmi || 0)}`}>
                {formatNumber(user?.bmi || 0, 1)}
              </p>
              <p className="text-sm text-gray-500">
                {getBMICategory(user?.bmi || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Macronutrients Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rozkład makroskładników
          </h3>
          {macronutrientData.length > 0 && macronutrientData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={macronutrientData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macronutrientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${formatNumber(Number(value), 1)}g`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Brak danych o posiłkach</p>
                <p className="text-sm">Dodaj swój pierwszy posiłek!</p>
              </div>
            </div>
          )}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {macronutrientData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <p className="font-medium">{formatNumber(item.value, 1)}g</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Meals by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Kalorie według posiłków
          </h3>
          {mealData.some(d => d.calories > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mealData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kcal`, 'Kalorie']} />
                <Bar dataKey="calories" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Brak danych o posiłkach</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Today's Meals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Posiłki z dnia {formatDate(selectedDate)}
          </h3>
          <Link
            to="/meals/add"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj posiłek
          </Link>
        </div>

        {dailySummary && dailySummary.meals_count > 0 ? (
          <div className="space-y-4">
            {mealTypes.map((type) => {
              const meals = dailySummary.meals_by_type[type];
              if (meals.length === 0) return null;

              return (
                <div key={type}>
                  <h4 className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(type)} mb-3`}>
                    {getMealTypeLabel(type)}
                  </h4>
                  <div className="grid gap-3">
                    {meals.map((meal) => (
                      <div key={meal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{meal.name}</h5>
                            {meal.description && (
                              <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium text-primary-600">{meal.calories} kcal</p>
                            <p className="text-xs text-gray-500">
                              B: {formatNumber(meal.protein, 1)}g | 
                              W: {formatNumber(meal.carbs, 1)}g | 
                              T: {formatNumber(meal.fat, 1)}g
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Brak posiłków na wybrany dzień
            </h4>
            <p className="text-gray-500 mb-6">
              Zacznij śledzić swoją dietę dodając pierwszy posiłek!
            </p>
            <Link
              to="/meals/add"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Dodaj pierwszy posiłek
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
