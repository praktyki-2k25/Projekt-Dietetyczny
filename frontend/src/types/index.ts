export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  weight?: number;
  height?: number;
  age?: number;
  bmi?: number;
  weight_goal?: number;
  gender?: 'male' | 'female';
  activity_level?: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Meal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  created_at: string;
}

export interface MealInput {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
}

export interface DailySummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals_count: number;
  date: string;
  meals_by_type: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snack: Meal[];
    other: Meal[];
  };
  daily_goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  percent_of_daily: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface AIAnalysis {
  meal_name: string;
  ingredients?: string[];
  original_values?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  estimated_values: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients_analysis?: {
    name: string;
    estimated_weight: number;
    nutritional_values: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  health_analysis?: string;
  allergens?: string[];
  suggestions?: string[];
  health_score?: number;
  confidence_score?: number;
}

export interface WeeklyReport {
  user: User;
  start_date: string;
  end_date: string;
  total_meals: number;
  days: Record<string, {
    date: string;
    meals_count: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meals: Meal[];
  }>;
  summary: {
    calories: { total: number; avg: number; min: number; max: number };
    protein: { total: number; avg: number; min: number; max: number };
    carbs: { total: number; avg: number; min: number; max: number };
    fat: { total: number; avg: number; min: number; max: number };
  };
  meal_types_frequency: Record<string, number>;
  trends: {
    calorie_trend: string;
    protein_trend: string;
    carbs_trend: string;
    fat_trend: string;
    meal_consistency: string;
  };
  suggestions?: string[];
}

export interface ApiError {
  message: string;
  error?: string;
}
