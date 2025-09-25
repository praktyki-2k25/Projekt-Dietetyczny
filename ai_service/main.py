"""
SERWIS AI - WERSJA 2.0 (NAPRAWIONA)
Kompatybilny z najnowszymi wersjami bibliotek
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import base64
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
import logging

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ładowanie zmiennych środowiskowych
load_dotenv()

# Inicjalizacja FastAPI
app = FastAPI(
    title="API do analizy posiłków z AI",
    description="Serwis analizy posiłków używający OpenAI GPT",
    version="2.0"
)

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sprawdzenie i inicjalizacja modeli AI
llm = None
vision_llm = None

try:
    # Import bibliotek OpenAI/LangChain
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import HumanMessage, SystemMessage
    from langchain_core.prompts import ChatPromptTemplate
    
    logger.info("✅ Importy LangChain pomyślne")
    
    # Sprawdź klucz API
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("❌ Brak klucza OPENAI_API_KEY w zmiennych środowiskowych")
        raise ValueError("Brak klucza API")
    
    logger.info(f"✅ Klucz API znaleziony: {api_key[:10]}...{api_key[-5:]}")
    
    # Inicjalizacja modelu tekstowego
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7,
        openai_api_key=api_key,
        max_tokens=1000
    )
    logger.info("✅ Model tekstowy (GPT-3.5) zainicjalizowany")
    
    # Inicjalizacja modelu wizyjnego
    vision_llm = ChatOpenAI(
        model="gpt-4o-mini", 
        temperature=0.7,
        openai_api_key=api_key,
        max_tokens=1500
    )
    logger.info("✅ Model wizyjny (GPT-4o-mini) zainicjalizowany")
    
except ImportError as e:
    logger.error(f"❌ Błąd importu bibliotek: {e}")
    logger.error("Uruchom: pip install langchain langchain-openai langchain-core openai")
except Exception as e:
    logger.error(f"❌ Błąd inicjalizacji modeli AI: {e}")

# Modele danych
class MealAnalysisRequest(BaseModel):
    name: str
    description: Optional[str] = None

class MealAnalysisResponse(BaseModel):
    estimated_values: Dict[str, int]
    health_analysis: str
    suggestions: List[str]

class DietRecommendationsRequest(BaseModel):
    user_data: Dict[str, Any]
    meal_history: List[Dict[str, Any]]

class DietRecommendationsResponse(BaseModel):
    recommendations: List[str]
    meal_suggestions: List[str]

# Endpointy API

@app.get("/")
async def health_check():
    """Sprawdzenie stanu serwisu"""
    return {
        "status": "ok",
        "message": "Serwis AI do analizy posiłków jest aktywny",
        "ai_enabled": llm is not None,
        "vision_enabled": vision_llm is not None,
        "version": "2.0"
    }

@app.get("/test")
async def test_ai():
    """Test podstawowej funkcjonalności AI"""
    if not llm:
        return {"error": "Model AI nie jest dostępny"}
    
    try:
        message = HumanMessage(content="Odpowiedz jednym słowem: test")
        response = llm.invoke([message])
        return {
            "status": "ok",
            "test_response": response.content,
            "message": "Model AI działa poprawnie"
        }
    except Exception as e:
        logger.error(f"Błąd testu AI: {e}")
        return {"error": f"Test AI nieudany: {str(e)}"}

@app.post("/analyze-meal")
async def analyze_meal(request: MealAnalysisRequest):
    """Analiza tekstowego opisu posiłku"""
    if not llm:
        return {"error": "Model AI nie jest dostępny"}
    
    try:
        prompt = f"""
Jesteś ekspertem dietetycznym. Przeanalizuj następujący posiłek:

Nazwa: {request.name}
Opis: {request.description or 'Brak opisu'}

Zadanie: Oszacuj wartości odżywcze i podaj sugestie.

Odpowiedz TYLKO w formacie JSON:
{{
  "estimated_values": {{
    "calories": liczba,
    "protein": liczba,
    "carbs": liczba,
    "fat": liczba
  }},
  "health_analysis": "Krótka analiza zdrowotna",
  "suggestions": [
    "Sugestia 1",
    "Sugestia 2", 
    "Sugestia 3"
  ]
}}
"""
        
        message = HumanMessage(content=prompt)
        response = llm.invoke([message])
        
        # Parsowanie JSON z odpowiedzi
        response_text = response.content.strip()
        
        # Usuń markdown jeśli występuje
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        # Walidacja struktury
        required_fields = ["estimated_values", "health_analysis", "suggestions"]
        if not all(field in result for field in required_fields):
            raise ValueError("Niepełna odpowiedź AI")
        
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"Błąd parsowania JSON: {e}")
        return get_mock_meal_analysis(request.name)
    except Exception as e:
        logger.error(f"Błąd analizy posiłku: {e}")
        return get_mock_meal_analysis(request.name)

@app.post("/analyze-meal-photo")
async def analyze_meal_photo(file: UploadFile = File(...)):
    """Analiza zdjęcia posiłku"""
    if not vision_llm:
        return {
            "error": "Model wizyjny nie jest dostępny",
            "details": "Sprawdź konfigurację OpenAI API"
        }
    
    try:
        logger.info(f"Otrzymano zdjęcie: {file.filename} ({file.content_type})")
        
        # Sprawdź typ pliku
        if file.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
            return {"error": "Nieprawidłowy format pliku. Używaj JPEG lub PNG."}
        
        # Wczytaj i przetworz zdjęcie
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:  # 5MB limit
            return {"error": "Plik zbyt duży. Maksymalny rozmiar: 5MB"}
        
        # Przetwórz obraz
        image = Image.open(BytesIO(contents))
        
        # Zmniejsz rozmiar jeśli potrzeba
        if max(image.size) > 1024:
            image.thumbnail((1024, 1024))
        
        # Konwertuj na base64
        buffered = BytesIO()
        format = image.format if image.format else "JPEG"
        image.save(buffered, format=format)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        logger.info(f"Przetworzono obraz: {image.size}, format: {format}")
        
        # Przygotuj prompt
        prompt = """
Jesteś ekspertem dietetycznym analizującym zdjęcia posiłków. 
Przeanalizuj zdjęcie i opisz co widzisz.

Odpowiedz TYLKO w formacie JSON:
{
  "meal_name": "Nazwa posiłku",
  "ingredients": ["składnik1", "składnik2"],
  "estimated_values": {
    "calories": liczba,
    "protein": liczba,
    "carbs": liczba,
    "fat": liczba
  },
  "health_analysis": "Analiza zdrowotna",
  "suggestions": [
    "Sugestia 1",
    "Sugestia 2",
    "Sugestia 3"
  ]
}
"""
        
        # Utwórz wiadomość z obrazem
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/{format.lower()};base64,{img_base64}"
                    }
                }
            ]
        )
        
        # Wywołaj model
        logger.info("Wysyłam zapytanie do modelu wizyjnego...")
        response = vision_llm.invoke([message])
        
        logger.info("Otrzymano odpowiedź od modelu")
        response_text = response.content.strip()
        
        # Parsuj JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        try:
            result = json.loads(response_text)
            logger.info(f"Rozpoznano posiłek: {result.get('meal_name', 'Nieznany')}")
            return result
        except json.JSONDecodeError:
            logger.error(f"Błąd parsowania JSON: {response_text[:200]}...")
            return {
                "error": "Nie można przeanalizować zdjęcia",
                "details": "Model AI nie zwrócił poprawnego formatu odpowiedzi"
            }
        
    except Exception as e:
        logger.error(f"Błąd analizy zdjęcia: {e}")
        return {
            "error": "Błąd podczas przetwarzania zdjęcia",
            "details": str(e)
        }

@app.post("/recommendations")
async def get_diet_recommendations(request: DietRecommendationsRequest):
    """Generowanie rekomendacji dietetycznych"""
    if not llm:
        return {"error": "Model AI nie jest dostępny"}
    
    try:
        prompt = f"""
Jesteś ekspertem dietetycznym. Na podstawie danych użytkownika i historii posiłków, 
stwórz rekomendacje dietetyczne.

Dane użytkownika: {json.dumps(request.user_data, indent=2)}
Historia posiłków: {json.dumps(request.meal_history[:10], indent=2)}

Odpowiedz TYLKO w formacie JSON:
{{
  "recommendations": [
    "Rekomendacja 1",
    "Rekomendacja 2",
    "Rekomendacja 3"
  ],
  "meal_suggestions": [
    "Posiłek 1",
    "Posiłek 2", 
    "Posiłek 3"
  ]
}}
"""
        
        message = HumanMessage(content=prompt)
        response = llm.invoke([message])
        
        response_text = response.content.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        logger.error(f"Błąd generowania rekomendacji: {e}")
        return get_mock_diet_recommendations()

# Funkcje pomocnicze - mockowe dane

def get_mock_meal_analysis(name: str):
    """Zwraca mockowe dane dla analizy posiłku"""
    name_lower = name.lower()
    
    if "jajko" in name_lower or "jajecznica" in name_lower:
        return {
            "estimated_values": {
                "calories": 350,
                "protein": 22,
                "carbs": 5,
                "fat": 28
            },
            "health_analysis": "Wysokobiałkowy posiłek z niską zawartością węglowodanów.",
            "suggestions": [
                "Dodaj warzywa dla zwiększenia błonnika",
                "Użyj mniej masła aby zmniejszyć kalorie",
                "Świetny wybór na śniadanie"
            ]
        }
    elif "kurczak" in name_lower:
        return {
            "estimated_values": {
                "calories": 520,
                "protein": 42,
                "carbs": 45,
                "fat": 12
            },
            "health_analysis": "Zbalansowany posiłek z wysoką zawartością białka.",
            "suggestions": [
                "Dodaj więcej kolorowych warzyw",
                "Świetne źródło białka po treningu",
                "Rozważ dodanie brązowego ryżu"
            ]
        }
    else:
        return {
            "estimated_values": {
                "calories": 400,
                "protein": 25,
                "carbs": 30,
                "fat": 15
            },
            "health_analysis": "Zbalansowany posiłek z umiarkowaną zawartością makroskładników.",
            "suggestions": [
                "Kontroluj wielkość porcji",
                "Dodaj więcej warzyw",
                "Ogranicz sól"
            ]
        }

def get_mock_diet_recommendations():
    """Zwraca mockowe rekomendacje dietetyczne"""
    return {
        "recommendations": [
            "Zwiększ spożycie białka do 1.2g/kg masy ciała",
            "Jedz regularne posiłki co 3-4 godziny",
            "Pij minimum 2 litry wody dziennie",
            "Ogranicz przetworzone produkty spożywcze"
        ],
        "meal_suggestions": [
            "Owsianka z owocami i orzechami na śniadanie",
            "Sałatka z grillowanym kurczakiem na lunch", 
            "Pieczone warzywa z rybą na obiad"
        ]
    }

# Uruchomienie serwera
if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Uruchamianie serwisu AI...")
    logger.info(f"AI Model: {'✅ Dostępny' if llm else '❌ Niedostępny'}")
    logger.info(f"Vision Model: {'✅ Dostępny' if vision_llm else '❌ Niedostępny'}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
