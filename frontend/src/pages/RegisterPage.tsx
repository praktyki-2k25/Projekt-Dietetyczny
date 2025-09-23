import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Select, Card } from '@/components/ui';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { getActivityLevelLabel } from '@/lib/utils';

export const RegisterPage: React.FC = () => {
  const { user, register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    weight: '',
    height: '',
    age: '',
    weight_goal: '',
    gender: '',
    activity_level: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email jest wymagany';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email jest nieprawidłowy';
    
    if (!formData.password) newErrors.password = 'Hasło jest wymagane';
    else if (formData.password.length < 6) newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Hasła nie pasują do siebie';
    
    if (!formData.username) newErrors.username = 'Nazwa użytkownika jest wymagana';
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      };

      // Add optional fields if provided
      if (formData.weight) registerData.weight = parseFloat(formData.weight);
      if (formData.height) registerData.height = parseInt(formData.height);
      if (formData.age) registerData.age = parseInt(formData.age);
      if (formData.weight_goal) registerData.weight_goal = parseFloat(formData.weight_goal);
      if (formData.gender) registerData.gender = formData.gender as 'male' | 'female';
      if (formData.activity_level) registerData.activity_level = formData.activity_level as 'low' | 'moderate' | 'high' | 'very_high';

      await register(registerData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { value: '', label: 'Wybierz płeć' },
    { value: 'male', label: 'Mężczyzna' },
    { value: 'female', label: 'Kobieta' }
  ];

  const activityOptions = [
    { value: '', label: 'Wybierz poziom aktywności' },
    { value: 'low', label: getActivityLevelLabel('low') },
    { value: 'moderate', label: getActivityLevelLabel('moderate') },
    { value: 'high', label: getActivityLevelLabel('high') },
    { value: 'very_high', label: getActivityLevelLabel('very_high') }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <UtensilsCrossed className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Utwórz nowe konto
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              zaloguj się do istniejącego konta
            </Link>
          </p>
        </div>
        
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Dane logowania
                </h3>
              </div>
              
              <Input
                id="email"
                name="email"
                label="Adres email *"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="twoj@email.com"
                autoComplete="email"
              />

              <Input
                id="username"
                name="username"
                label="Nazwa użytkownika *"
                type="text"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="Twoja nazwa użytkownika"
                autoComplete="username"
              />

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  label="Hasło *"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Minimum 6 znaków"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Potwierdź hasło *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Powtórz hasło"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="md:col-span-2 mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Dane osobowe (opcjonalne)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Te dane pomogą nam lepiej dostosować rekomendacje żywieniowe
                </p>
              </div>

              <Input
                id="weight"
                name="weight"
                label="Waga (kg)"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.weight}
                onChange={handleChange}
                placeholder="75.5"
              />

              <Input
                id="height"
                name="height"
                label="Wzrost (cm)"
                type="number"
                min="120"
                max="250"
                value={formData.height}
                onChange={handleChange}
                placeholder="175"
              />

              <Input
                id="age"
                name="age"
                label="Wiek (lata)"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="30"
              />

              <Input
                id="weight_goal"
                name="weight_goal"
                label="Cel wagowy (kg)"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.weight_goal}
                onChange={handleChange}
                placeholder="70.0"
              />

              <Select
                id="gender"
                name="gender"
                label="Płeć"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
              />

              <Select
                id="activity_level"
                name="activity_level"
                label="Poziom aktywności fizycznej"
                value={formData.activity_level}
                onChange={handleChange}
                options={activityOptions}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Utwórz konto
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
