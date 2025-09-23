import axios from 'axios';
import { AuthResponse, User, Meal, MealInput, DailySummary, AIAnalysis, WeeklyReport } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    username: string;
    weight?: number;
    height?: number;
    age?: number;
    weight_goal?: number;
    gender?: 'male' | 'female';
    activity_level?: 'low' | 'moderate' | 'high' | 'very_high';
  }): Promise<AuthResponse> => {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put('/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

export const mealsApi = {
  getMeals: async (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    sort?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Meal[]> => {
    const response = await api.get('/meals', { params });
    return response.data;
  },

  getMeal: async (id: number): Promise<Meal> => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  createMeal: async (meal: MealInput): Promise<Meal> => {
    const response = await api.post('/meals', meal);
    return response.data;
  },

  createMealWithAnalysis: async (data: {
    name: string;
    ingredients: string;
    meal_type: string;
    meal_date: string;
  }): Promise<{ meal: Meal; ai_analysis: AIAnalysis }> => {
    const response = await api.post('/meals/with-analysis', data);
    return response.data;
  },

  updateMeal: async (id: number, meal: Partial<MealInput>): Promise<Meal> => {
    const response = await api.put(`/meals/${id}`, meal);
    return response.data;
  },

  deleteMeal: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },

  analyzeMeal: async (data: {
    name: string;
    ingredients: string;
    meal_type: string;
  }): Promise<AIAnalysis> => {
    const response = await api.post('/meals/analyze', data);
    return response.data;
  },

  getDailySummary: async (date?: string): Promise<DailySummary> => {
    const response = await api.get('/meals/summary/daily', {
      params: { date },
    });
    return response.data;
  },

  shareMeal: async (id: number, email: string, message?: string): Promise<{ message: string; shared_meal_id: number }> => {
    const response = await api.post(`/meals/${id}/share`, { email, message });
    return response.data;
  },
};

export const reportsApi = {
  getDailyReport: async (date?: string): Promise<DailySummary & { suggestions?: string[] }> => {
    const response = await api.get('/reports/daily', {
      params: { date },
    });
    return response.data;
  },

  getWeeklyReport: async (endDate?: string): Promise<WeeklyReport> => {
    const response = await api.get('/reports/weekly', {
      params: { endDate },
    });
    return response.data;
  },
};

export const aiApi = {
  analyzeMeal: async (data: {
    name: string;
    ingredients: string;
    meal_type: string;
  }): Promise<AIAnalysis> => {
    const response = await api.post('/ai/analyze-meal', data);
    return response.data;
  },

  getDietRecommendations: async (): Promise<{ recommendations: string[] }> => {
    const response = await api.get('/ai/diet-recommendations');
    return response.data;
  },
};

export default api;
