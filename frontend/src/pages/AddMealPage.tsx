import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealsApi } from '@/lib/api';
import { Button, Input, Select, Textarea, Card, Modal } from '@/components/ui';
import { formatDateInput, getMealTypeLabel } from '@/lib/utils';
import { Brain, Plus, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AIAnalysis, MealInput } from '@/types';

export const AddMealPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MealInput>({
    name: '',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    meal_date: formatDateInput(new Date()),
    meal_type: 'breakfast'
  });
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [useAiValues, setUseAiValues] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mealTypeOptions = [
    { value: 'breakfast', label: getMealTypeLabel('breakfast') },
    { value: 'lunch', label: getMealTypeLabel('lunch') },
    { value: 'dinner', label: getMealTypeLabel('dinner') },
    { value: 'snack', label: getMealTypeLabel('snack') },
    { value: 'other', label: getMealTypeLabel('other') },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calories' || name === 'protein' || name === 'carbs' || name === 'fat' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleAiAnalysis = async () => {
    if (!formData.name || !ingredients) {
      toast.error('Podaj nazwę posiłku i składniki do analizy');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Wysyłanie do analizy:', { name: formData.name, ingredients, meal_type: formData.meal_type });
      const response = await mealsApi.analyzeMeal({
        name: formData.name,
        ingredients: ingredients,
        meal_type: formData.meal_type
      });
      
      console.log('Otrzymano analizę:', response);
      setAiAnalysis(response);
      setShowAnalysisModal(true);
    } catch (error) {
      console.error('Błąd analizy AI:', error);
      const message = error.response?.data?.message || 'Błąd podczas analizy AI';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiValues = () => {
    if (aiAnalysis) {
      setFormData(prev => ({
        ...prev,
        calories: aiAnalysis.estimated_values.calories,
        protein: aiAnalysis.estimated_values.protein,
        carbs: aiAnalysis.estimated_values.carbs,
        fat: aiAnalysis.estimated_values.fat,
      }));
      setUseAiValues(true);
      setShowAnalysisModal(false);
      toast.success('Wartości z analizy AI zostały zastosowane');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nazwa posiłku jest wymagana';
    if (formData.calories <= 0) newErrors.calories = 'Kalorie muszą być większe od 0';
    if (formData.protein < 0) newErrors.protein = 'Białko nie może być ujemne';
    if (formData.carbs < 0) newErrors.carbs = 'Węglowodany nie mogą być ujemne';
    if (formData.fat < 0) newErrors.fat = 'Tłuszcz nie może być ujemny';
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await mealsApi.createMeal(formData);
      toast.success('Posiłek został dodany pomyślnie!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Błąd podczas dodawania posiłku';
      toast.error(message);
      console.error('Failed to create meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithAi = async () => {
    if (!formData.name || !ingredients) {
      toast.error('Podaj nazwę posiłku i składniki');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await mealsApi.createMealWithAnalysis({
        name: formData.name,
        ingredients: ingredients,
        meal_type: formData.meal_type,
        meal_date: formData.meal_date
      });
      
      toast.success('Posiłek został dodany z analizą AI!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Błąd podczas dodawania posiłku z analizą AI';
      toast.error(message);
      console.error('Failed to create meal with AI:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dodaj nowy posiłek</h1>
        <p className="text-gray-600">
          Dodaj posiłek ręcznie lub skorzystaj z analizy AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Form */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Dodaj posiłek ręcznie
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nazwa posiłku *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="np. Jajecznica z pomidorami"
            />

            <Textarea
              label="Opis (opcjonalny)"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Opcjonalny opis posiłku..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data *"
                name="meal_date"
                type="date"
                value={formData.meal_date}
                onChange={handleInputChange}
              />

              <Select
                label="Typ posiłku *"
                name="meal_type"
                value={formData.meal_type}
                onChange={handleInputChange}
                options={mealTypeOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kalorie *"
                name="calories"
                type="number"
                step="1"
                min="0"
                value={formData.calories || ''}
                onChange={handleInputChange}
                error={errors.calories}
                placeholder="350"
              />

              <Input
                label="Białko (g) *"
                name="protein"
                type="number"
                step="0.1"
                min="0"
                value={formData.protein || ''}
                onChange={handleInputChange}
                error={errors.protein}
                placeholder="25.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Węglowodany (g) *"
                name="carbs"
                type="number"
                step="0.1"
                min="0"
                value={formData.carbs || ''}
                onChange={handleInputChange}
                error={errors.carbs}
                placeholder="45.0"
              />

              <Input
                label="Tłuszcz (g) *"
                name="fat"
                type="number"
                step="0.1"
                min="0"
                value={formData.fat || ''}
                onChange={handleInputChange}
                error={errors.fat}
                placeholder="15.2"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj posiłek
            </Button>
          </form>
        </Card>

        {/* AI Analysis Form */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Brain className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Analiza AI
            </h2>
          </div>
          
          <div className="space-y-6">
            <Input
              label="Nazwa posiłku *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="np. Jajecznica z pomidorami"
            />

            <Textarea
              label="Składniki *"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="np. 2 jajka, 1 pomidor, 1 łyżka masła, szczypiorek, sól, pieprz"
              rows={4}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data *"
                type="date"
                value={formData.meal_date}
                onChange={(e) => setFormData(prev => ({ ...prev, meal_date: e.target.value }))}
              />

              <Select
                label="Typ posiłku *"
                value={formData.meal_type}
                onChange={(e) => setFormData(prev => ({ ...prev, meal_type: e.target.value as any }))}
                options={mealTypeOptions}
              />
            </div>

            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleAiAnalysis}
                className="w-full"
                isLoading={isAnalyzing}
                disabled={!formData.name || !ingredients}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analizuj składniki
              </Button>

              <Button
                type="button"
                onClick={handleSubmitWithAi}
                className="w-full"
                variant="secondary"
                isLoading={isSubmitting}
                disabled={!formData.name || !ingredients}
              >
                <Brain className="w-4 h-4 mr-2" />
                Dodaj z analizą AI
              </Button>
            </div>

            {useAiValues && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    Zastosowano wartości z analizy AI
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Wskazówka:</p>
                  <p>
                    Podaj dokładne składniki z ilościami (np. "2 jajka, 100g ryżu, 1 łyżka oliwy") 
                    aby uzyskać najdokładniejszą analizę wartości odżywczych.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Analysis Modal */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title="Wyniki analizy AI"
        size="lg"
      >
        {aiAnalysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Wartości odżywcze</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Kalorie:</span>
                    <span className="font-medium">{aiAnalysis.estimated_values.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Białko:</span>
                    <span className="font-medium">{aiAnalysis.estimated_values.protein.toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Węglowodany:</span>
                    <span className="font-medium">{aiAnalysis.estimated_values.carbs.toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tłuszcz:</span>
                    <span className="font-medium">{aiAnalysis.estimated_values.fat.toFixed(1)} g</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informacje dodatkowe</h4>
                {aiAnalysis.health_score && (
                  <div className="mb-2">
                    <span className="text-sm">Ocena zdrowotna: </span>
                    <span className="font-medium">{aiAnalysis.health_score}/10</span>
                  </div>
                )}
                {aiAnalysis.confidence_score && (
                  <div className="mb-2">
                    <span className="text-sm">Pewność analizy: </span>
                    <span className="font-medium">{Math.round(aiAnalysis.confidence_score * 100)}%</span>
                  </div>
                )}
              </div>
            </div>

            {aiAnalysis.allergens && aiAnalysis.allergens.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Alergeny</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sugestie</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {aiAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button onClick={applyAiValues} className="flex-1">
                Zastosuj te wartości
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowAnalysisModal(false)}
                className="flex-1"
              >
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
