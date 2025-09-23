# Frontend Aplikacji Dietetycznej

Nowoczesny frontend aplikacji dietetycznej zbudowany w React + TypeScript z integracją AI.

## 🚀 Funkcje

### ✅ Zaimplementowane
- **Uwierzytelnianie** - logowanie i rejestracja użytkowników
- **Dashboard** - przegląd dziennych statystyk i posiłków
- **Dodawanie posiłków** - ręcznie lub z analizą AI
- **Analiza AI** - automatyczne obliczanie wartości odżywczych
- **Responsywny design** - dostosowany do urządzeń mobilnych
- **Wykresy i statystyki** - wizualizacja danych żywieniowych

### 🔜 W trakcie implementacji
- Lista wszystkich posiłków z filtrowaniem
- Szczegółowe raporty tygodniowe/miesięczne
- Zarządzanie profilem użytkownika
- Udostępnianie posiłków innym użytkownikom

## 🛠 Technologie

- **React 18** - biblioteka UI
- **TypeScript** - typowanie statyczne
- **Vite** - szybki bundler
- **Tailwind CSS** - utility-first CSS framework
- **React Router** - routing
- **React Hook Form** - zarządzanie formularzami
- **React Query** - zarządzanie stanem serwera
- **Recharts** - wykresy i wizualizacje
- **Axios** - HTTP client
- **React Hot Toast** - notyfikacje

## 📦 Instalacja

1. **Zainstaluj zależności:**
   ```bash
   cd frontend
   npm install
   ```

2. **Uruchom serwer deweloperski:**
   ```bash
   npm run dev
   ```
   
   Frontend będzie dostępny pod adresem: http://localhost:3000

3. **Upewnij się że backend działa:**
   Backend powinien działać na porcie 5000. Proxy w Vite automatycznie przekieruje żądania API.

## 🏗 Struktura projektu

```
frontend/
├── src/
│   ├── components/           # Komponenty wielokrotnego użytku
│   │   ├── ui/              # Podstawowe komponenty UI
│   │   ├── Navbar.tsx       # Nawigacja główna
│   │   └── ProtectedRoute.tsx # Ochrona tras
│   ├── contexts/            # Konteksty React
│   │   └── AuthContext.tsx  # Kontekst uwierzytelniania
│   ├── lib/                 # Biblioteki i utilitki
│   │   ├── api.ts          # Klient API
│   │   └── utils.ts        # Funkcje pomocnicze
│   ├── pages/               # Strony aplikacji
│   │   ├── LoginPage.tsx    # Logowanie
│   │   ├── RegisterPage.tsx # Rejestracja
│   │   ├── DashboardPage.tsx # Dashboard główny
│   │   └── AddMealPage.tsx  # Dodawanie posiłków
│   ├── types/               # Definicje typów TypeScript
│   │   └── index.ts
│   ├── App.tsx              # Główny komponent aplikacji
│   ├── main.tsx            # Entry point
│   └── index.css           # Style globalne
├── public/                  # Pliki statyczne
├── index.html              # Template HTML
├── package.json            # Zależności
├── tailwind.config.js      # Konfiguracja Tailwind
├── vite.config.ts         # Konfiguracja Vite
└── tsconfig.json          # Konfiguracja TypeScript
```

## 🔧 Konfiguracja API

Frontend komunikuje się z backendem przez proxy skonfigurowany w `vite.config.ts`:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 🎨 Design System

### Kolory
- **Primary**: Odcienie zieleni (#22c55e)
- **Secondary**: Szarości
- **Success**: Zielony (#10b981)
- **Warning**: Żółty (#f59e0b)
- **Error**: Czerwony (#ef4444)

### Komponenty UI
- `Button` - przyciski z wariantami
- `Input` - pola formularzy
- `Select` - listy rozwijane
- `Card` - karty zawartości
- `Modal` - okna modalne
- `LoadingSpinner` - wskaźnik ładowania

## 🧪 Testowanie

### Konto testowe
Możesz używać konta testowego:
- **Email:** test@example.com
- **Hasło:** haslo123

### Sprawdzenie działania
1. Zaloguj się na konto testowe
2. Przejdź na Dashboard - powinieneś zobaczyć statystyki
3. Dodaj nowy posiłek używając AI lub ręcznie
4. Sprawdź czy posiłek pojawił się na Dashboard

## 🚀 Budowanie produkcyjne

```bash
# Budowanie aplikacji
npm run build

# Podgląd wersji produkcyjnej
npm run preview
```

## 🔍 Debugowanie

### Problemy z API
1. Sprawdź czy backend działa na porcie 5000
2. Sprawdź Network tab w DevTools
3. Sprawdź konsole dla błędów CORS

### Problemy z uwierzytelnianiem
1. Sprawdź Local Storage dla tokenu
2. Sprawdź czy token jest dodawany do nagłówków
3. Sprawdź czy backend zwraca prawidłowy token

## 📱 Responsive Design

Aplikacja jest w pełni responsywna:
- **Desktop**: Pełna funkcjonalność z boczną nawigacją
- **Tablet**: Dostosowany layout z składaną nawigacją
- **Mobile**: Zoptymalizowane formularze i nawigacja mobilna

## 🎯 Następne kroki

1. **Lista posiłków** - strona z wszystkimi posiłkami użytkownika
2. **Edycja posiłków** - możliwość modyfikacji dodanych posiłków
3. **Raporty zaawansowane** - szczegółowe analizy miesięczne
4. **Profile użytkownika** - zarządzanie danymi osobowymi
5. **PWA** - Progressive Web App dla instalacji na urządzeniach
6. **Tryb offline** - podstawowa funkcjonalność bez internetu

## 🐛 Zgłaszanie błędów

Jeśli znajdziesz błąd:
1. Sprawdź konsolę przeglądarki
2. Sprawdź Network tab w DevTools
3. Opisz kroki do reprodukcji problemu
4. Podaj informacje o przeglądarce i systemie
