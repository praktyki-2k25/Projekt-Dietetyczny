import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getMealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    breakfast: 'Śniadanie',
    lunch: 'Lunch',
    dinner: 'Kolacja',
    snack: 'Przekąska',
    other: 'Inne',
  };
  return labels[type] || type;
}

export function getMealTypeColor(type: string): string {
  const colors: Record<string, string> = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors.other;
}

export function calculateBMI(weight: number, height: number): number {
  return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Niedowaga';
  if (bmi < 25) return 'Waga prawidłowa';
  if (bmi < 30) return 'Nadwaga';
  return 'Otyłość';
}

export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return 'text-blue-600';
  if (bmi < 25) return 'text-green-600';
  if (bmi < 30) return 'text-yellow-600';
  return 'text-red-600';
}

export function calculateDailyCalories(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'low' | 'moderate' | 'high' | 'very_high'
): number {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const multipliers: Record<string, number> = {
    low: 1.2,
    moderate: 1.55,
    high: 1.725,
    very_high: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

export function getActivityLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    low: 'Niska (siedzący tryb życia)',
    moderate: 'Umiarkowana (ćwiczenia 1-3 razy w tygodniu)',
    high: 'Wysoka (ćwiczenia 4-6 razy w tygodniu)',
    very_high: 'Bardzo wysoka (codzienne ćwiczenia)',
  };
  return labels[level] || level;
}

export function formatNumber(num: number, decimals: number = 1): string {
  return num.toLocaleString('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getHealthScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 8) return 'Bardzo dobry';
  if (score >= 6) return 'Dobry';
  if (score >= 4) return 'Średni';
  return 'Wymaga poprawy';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function isToday(date: Date | string): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateInput(date);
}
