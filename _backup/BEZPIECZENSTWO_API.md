# 🔐 BEZPIECZEŃSTWO API - WAŻNE INFORMACJE

## ⚠️ PROBLEM: KLUCZ API BYŁ WKLEJONY W KODZIE

**Twój klucz OpenAI API był widoczny w:**
- `ai_service/.env` 
- `1_URUCHOM_AI.bat`

**To jest poważny problem bezpieczeństwa!** 

## 🛡️ CO ZOSTAŁO NAPRAWIONE:

1. ✅ Usunięto klucz z plików skryptów
2. ✅ Dodano .env do .gitignore 
3. ✅ Utworzono .env.example jako wzorzec
4. ✅ Stworzono bezpieczny skrypt konfiguracji

## 🔑 JAK BEZPIECZNIE SKONFIGUROWAĆ KLUCZ API:

### Opcja 1: Użyj automatycznego skryptu
```bat
KONFIGURUJ_API.bat
```

### Opcja 2: Ręcznie
1. Przejdź na https://platform.openai.com/api-keys
2. Zaloguj się i utwórz nowy klucz API  
3. Edytuj plik `ai_service/.env`
4. Wklej: `OPENAI_API_KEY=sk-proj-twój_klucz`

## ❌ CZEGO NIE ROBIĆ:

- ❌ NIE wklejaj klucza do kodu źródłowego
- ❌ NIE commituj pliku .env do Git
- ❌ NIE udostępniaj klucza przez email/chat
- ❌ NIE wklejaj klucza na forum/stackoverflow
- ❌ NIE używaj klucza w publicznych repozytoriach

## ✅ DOBRE PRAKTYKI:

- ✅ Przechowuj klucz tylko w pliku .env
- ✅ Dodaj .env do .gitignore  
- ✅ Używaj różnych kluczy dla dev/prod
- ✅ Regularnie sprawdzaj usage w OpenAI dashboard
- ✅ Ustaw limity wydatków w OpenAI
- ✅ Odwołaj stary klucz jeśli został ujawniony

## 🚨 JEŚLI KLUCZ ZOSTAŁ UJAWNIONY:

1. **Natychmiast idź na:** https://platform.openai.com/api-keys
2. **Usuń skompromitowany klucz** (przycisk Delete)
3. **Utwórz nowy klucz**
4. **Zaktualizuj .env** nowym kluczem
5. **Sprawdź billing** czy nie ma niepożądanego użycia

## 📁 STRUKTURA PLIKÓW PO NAPRAWIE:

```
ai_service/
├── .env              ← TWÓJ KLUCZ (w .gitignore)
├── .env.example      ← Przykład (bezpieczny)
└── main.py          ← Kod (bez klucza)
```

## 🔍 SPRAWDŹ CZY KLUCZ JUŻ NIE JEST W GIT:

```bash
git log --all -S "sk-proj-" --source --all
```

Jeśli coś znajdzie - skontaktuj się po pomoc w usunięciu z historii Git.

## 📞 W RAZIE PROBLEMÓW:

1. Uruchom: `KONFIGURUJ_API.bat`
2. Test: `TEST_AI_SZYBKO.bat`
3. Sprawdź: https://platform.openai.com/usage

---

**🛡️ Pamiętaj: Klucz API to jak hasło do Twojego konta - traktuj go poważnie!**
