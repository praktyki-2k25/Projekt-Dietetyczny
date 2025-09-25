import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '@/lib/api';
import { Button, Input, Select, Card, Modal } from '@/components/ui';
import { Camera, Upload, Sparkles, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateInput, getMealTypeLabel } from '@/lib/utils';
import { AIAnalysis } from '@/types';

export const MealPhotoAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [mealDate, setMealDate] = useState(formatDateInput(new Date()));
  const [mealType, setMealType] = useState('lunch');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mealTypeOptions = [
    { value: 'breakfast', label: getMealTypeLabel('breakfast') },
    { value: 'lunch', label: getMealTypeLabel('lunch') },
    { value: 'dinner', label: getMealTypeLabel('dinner') },
    { value: 'snack', label: getMealTypeLabel('snack') },
    { value: 'other', label: getMealTypeLabel('other') },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
      toast.error('Tylko obrazy w formacie JPEG, JPG i PNG są akceptowane');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Maksymalny rozmiar zdjęcia to 5MB');
      return;
    }
    
    setSelectedImage(file);
    setErrorMessage(null);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      toast.error('Najpierw wybierz zdjęcie');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    
    try {
      console.log('Wysyłanie do analizy:', selectedImage);
      const result = await aiApi.analyzeMealPhoto(selectedImage);
      
      if (result.error) {
        // Jeśli otrzymaliśmy obiekt z błędem
        console.error('Błąd analizy:', result.error, result.details);
        setErrorMessage(result.error || 'Błąd podczas analizy zdjęcia');
        toast.error(result.error || 'Błąd podczas analizy zdjęcia');
      } else {
        setAnalysisResult(result.analysis);
        setShowAnalysisModal(true);
      }
    } catch (error: any) {
      console.error('Błąd podczas analizy zdjęcia:', error);
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Nie udało się przeanalizować zdjęcia';
      
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!selectedImage) {
      toast.error('Najpierw wybierz zdjęcie');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      const result = await aiApi.saveMealFromPhoto(selectedImage, {
        meal_date: mealDate,
        meal_type: mealType
      });
      
      if (result.error) {
        console.error('Błąd zapisu:', result.error);
        setErrorMessage(result.error || 'Błąd podczas zapisywania posiłku');
        toast.error(result.error || 'Błąd podczas zapisywania posiłku');
      } else {
        toast.success(result.message || 'Posiłek został dodany!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Błąd podczas zapisywania posiłku:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Nie udało się zapisać posiłku ze zdjęcia';
      
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button 
          className="mr-4 text-gray-600 hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analiza posiłku ze zdjęcia</h1>
          <p className="text-gray-600">
            Zrób zdjęcie swojego posiłku lub wgraj istniejące zdjęcie
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Camera className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Zdjęcie posiłku
            </h2>
          </div>

          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />

            <div 
              className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-6"
              onClick={handleClickUpload}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Podgląd posiłku" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Kliknij, aby wgrać zdjęcie</p>
                  <p className="text-xs text-gray-500">JPG, JPEG lub PNG, max. 5MB</p>
                </>
              )}
            </div>

            <Button
              onClick={handleClickUpload}
              variant="secondary"
              className="w-full mb-4"
              disabled={isAnalyzing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedImage ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
            </Button>
          </div>
        </Card>

        {/* Analysis Section */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Analiza AI
            </h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data posiłku *"
                type="date"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
              />

              <Select
                label="Typ posiłku *"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                options={mealTypeOptions}
              />
            </div>

            {isAnalyzing && (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-700">Analizowanie zdjęcia... To może potrwać 15-30 sekund.</p>
              </div>
            )}

            {errorMessage && !isAnalyzing && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Błąd analizy:</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <Button
                onClick={handleAnalyzePhoto}
                className="w-full"
                isLoading={isAnalyzing}
                disabled={!selectedImage || isAnalyzing}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analizuj zdjęcie
              </Button>

              <Button
                onClick={handleSaveMeal}
                className="w-full"
                variant="secondary"
                isLoading={isSaving}
                disabled={!selectedImage || isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                Zapisz posiłek ze zdjęcia
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Jak to działa?</p>
                  <p>
                    Sztuczna inteligencja analizuje zdjęcie i automatycznie rozpoznaje posiłek, 
                    jego składniki oraz szacuje wartości odżywcze. Możesz przeanalizować zdjęcie 
                    lub od razu zapisać posiłek w dzienniku.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analysis Results Modal */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title="Wyniki analizy AI"
        size="lg"
      >
        {analysisResult ? (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-lg text-gray-900 mb-2">
                {analysisResult.meal_name}
              </h3>
              
              {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-sm text-gray-700 mb-1">Rozpoznane składniki:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.ingredients.map((ingredient, idx) => (
                      <span 
                        key={idx}
                        className="inline-block px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Wartości odżywcze</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Kalorie:</span>
                    <span className="font-medium">{analysisResult.estimated_values.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Białko:</span>
                    <span className="font-medium">{analysisResult.estimated_values.protein.toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Węglowodany:</span>
                    <span className="font-medium">{analysisResult.estimated_values.carbs.toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tłuszcz:</span>
                    <span className="font-medium">{analysisResult.estimated_values.fat.toFixed(1)} g</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Analiza zdrowotna</h4>
                <p className="text-sm text-gray-700">
                  {analysisResult.health_analysis}
                </p>
              </div>
            </div>

            {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sugestie</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleSaveMeal} className="flex-1" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz ten posiłek
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
        ) : (
          <div className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nie można przeanalizować zdjęcia</h3>
            <p className="text-gray-600 mb-6">Wystąpił problem podczas analizy zdjęcia. Upewnij się, że zdjęcie jest wyraźne i przedstawia posiłek.</p>
            <Button 
              variant="secondary" 
              onClick={() => setShowAnalysisModal(false)} 
              className="w-full"
            >
              Zamknij
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};