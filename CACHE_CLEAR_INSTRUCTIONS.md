# 🧹 Instrukcja czyszczenia cache na MacBooku

## Problem
Konsola pokazuje 18 kursów z Supabase, ale ekran wyświetla stare testowe dane.

## Rozwiązanie: PEŁNE WYCZYSZCZENIE CACHE

### ✅ Metoda 1: Pełne czyszczenie (ZALECANE)

1. **Zamknij CAŁKOWICIE przeglądarkę**
   - Cmd + Q (nie tylko zamknij kartę!)
   - Upewnij się, że przeglądarka nie działa w tle

2. **Wyczyść cache systemowy** (opcjonalne, ale skuteczne):
   ```bash
   # Safari
   rm -rf ~/Library/Caches/com.apple.Safari

   # Chrome
   rm -rf ~/Library/Caches/Google/Chrome
   rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Service\ Worker

   # Firefox
   rm -rf ~/Library/Caches/Firefox
   ```

3. **Otwórz przeglądarkę na nowo**

4. **W przeglądarce:**
   - Cmd + Shift + Delete
   - Wybierz:
     ✅ Cookies and site data
     ✅ Cached images and files
   - Time range: **All time**
   - Clear data

5. **Wyrejestruj Service Worker:**
   - F12 (otwórz DevTools)
   - Application → Service Workers
   - Znajdź service-worker.js
   - Kliknij "Unregister"

6. **Hard refresh:**
   - Cmd + Shift + R (kilka razy!)

---

### ✅ Metoda 2: Tryb Incognito (szybki test)

1. Otwórz **nową kartę incognito** (Cmd + Shift + N)
2. Wejdź na swoją stronę
3. Sprawdź, czy teraz widać poprawne dane

**Jeśli w Incognito działa** = problem jest w cache

---

### ✅ Metoda 3: Reset całkowity (ostateczność)

Jeśli nic nie pomaga:

```bash
# 1. Zatrzymaj dev server
# 2. Wyczyść dist/
rm -rf dist/

# 3. Wyczyść node_modules/.vite
rm -rf node_modules/.vite

# 4. Przebuduj
npm run build

# 5. Uruchom ponownie dev server
npm run dev
```

---

## 🔍 Jak zweryfikować, że działa?

### W konsoli przeglądarki (F12) zobaczysz:

```
🔵 START loadSchedules()
📡 Wysyłam zapytanie do Supabase...
✅ Pobrano rozkład autobusów: 18 kursów
🕐 Pierwsze 3 czasy z Supabase: ["05:45", "06:30", "07:15"]
🎯 Przed setSchedules() - combined.length: 18
🎯 IDs które będą ustawione: ["abc123...", "def456...", ...]
🎯 Czasy które będą ustawione: ["05:45", "06:30", "07:15"]
✅ Zaktualizowano stan z 18 kursami
🔵 KONIEC loadSchedules()
🔄 BusModule RENDER - schedules.length: 18
📊 Aktualne schedules IDs: ["abc123...", ...]
⏰ Pierwsze 3 godziny odjazdu: ["05:45", "06:30", "07:15"]
```

### Na ekranie zobaczysz:

1. **Zielony banner**: "✅ Dane zaktualizowane z Supabase (18 kursów)"
2. **Debug panel** (rozwijany): "🔍 Debug: Stan schedules (18 kursów)"
3. **Poprawne godziny** z bazy danych

---

## ❗ Co zostało zmienione w kodzie?

### 1. Service Worker
- Zmieniono CACHE_NAME z `v2-fresh` na `v3-supabase-only`
- Wymusza pełne przeładowanie cache

### 2. BusModule
- Dodano klucz `key="bus-module-supabase-only"` w App.tsx
- Wymusza rerender komponentu

### 3. Debug logi
- Szczegółowe logi w każdym kroku pobierania danych
- Wizualizacja stanu schedules w interfejsie

### 4. Brak mock data
- ✅ Potwierdzono: ZERO zmiennych INITIAL_BUSES
- ✅ Stan początkowy: `useState([])`  - pusta tablica
- ✅ Dane TYLKO z Supabase

---

## 📞 Jeśli nadal nie działa

Wyślij mi screenshot:
1. Konsoli (F12) ze wszystkimi logami
2. Debug panelu (rozwiń "🔍 Debug: Stan schedules")
3. Zakładki Application → Service Workers w DevTools

UWAGA: Jeśli w konsoli widzisz "18 kursów", ale na ekranie coś innego - to 100% problem z cache!
