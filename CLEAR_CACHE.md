# Instrukcja czyszczenia cache przeglądarki

## Problem
Strona wciąż wyświetla stare dane, mimo że baza Supabase została zaktualizowana.

## Rozwiązanie

### Krok 1: Wymuś restart serwera deweloperskiego
Zatrzymaj i uruchom ponownie serwer deweloperski, aby załadować nowe zmienne środowiskowe:

```bash
# Zatrzymaj serwer (Ctrl+C)
# Uruchom ponownie:
npm run dev
```

### Krok 2: Wyczyść cache przeglądarki

#### Chrome/Edge:
1. Otwórz Narzędzia deweloperskie (F12)
2. Kliknij prawym przyciskiem na ikonę odświeżania (obok paska adresu)
3. Wybierz **"Wyczyść pamięć podręczną i wymuś przeładowanie"** lub **"Empty Cache and Hard Reload"**

Lub:
1. Otwórz Chrome DevTools (F12)
2. Przejdź do zakładki **Application** (Aplikacja)
3. W menu po lewej kliknij **Storage** (Pamięć)
4. Kliknij **Clear site data** (Wyczyść dane witryny)

#### Firefox:
1. Otwórz Narzędzia deweloperskie (F12)
2. Przejdź do zakładki **Storage** (Pamięć)
3. Kliknij prawym przyciskiem na **IndexedDB**, **Local Storage**, **Session Storage**
4. Wybierz **Delete All** (Usuń wszystko)
5. Naciśnij Ctrl+F5 (hard reload)

#### Safari:
1. Włącz menu deweloperskie: Safari > Preferencje > Zaawansowane > "Pokaż menu Deweloper"
2. Naciśnij Option + Command + E (wyczyść cache)
3. Przeładuj stronę (Command + R)

### Krok 3: Wyczyść localStorage (opcjonalne)
Otwórz konsolę przeglądarki (F12) i wpisz:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Krok 4: Tryb incognito/prywatny
Jako ostateczność, otwórz stronę w trybie incognito/prywatnym:
- Chrome/Edge: Ctrl + Shift + N
- Firefox: Ctrl + Shift + P
- Safari: Command + Shift + N

## Co zostało naprawione

1. ✅ **Zaktualizowano adres bazy Supabase** w pliku `.env`:
   - Stary: `nleukmxdcpkualqnyclg.supabase.co`
   - Nowy: `xldjjzukedntmqcaaeve.supabase.co`

2. ✅ **Usunięto plik z danymi testowymi**:
   - `supabase/migrations/20260213142744_insert_sample_data_fixed.sql`

3. ✅ **Brak hardcoded danych**:
   - Wszystkie komponenty pobierają dane wyłącznie z Supabase
   - Brak fallback do starych danych
   - Kod używa zmiennych środowiskowych (`import.meta.env.VITE_SUPABASE_URL`)

## Weryfikacja

Po wyczyszczeniu cache, otwórz konsolę przeglądarki (F12) i sprawdź:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
// Powinno pokazać: https://xldjjzukedntmqcaaeve.supabase.co
```

## Troubleshooting

Jeśli problem nadal występuje:

1. **Sprawdź Network tab** w DevTools:
   - Upewnij się, że requesty idą do `xldjjzukedntmqcaaeve.supabase.co`
   - Jeśli nadal idą do starego adresu, restart serwera i hard refresh

2. **Sprawdź Service Worker**:
   - Otwórz DevTools > Application > Service Workers
   - Kliknij **Unregister** na wszystkich service workers
   - Odśwież stronę

3. **Sprawdź pliki statyczne**:
   - Usuń folder `dist/` i `node_modules/.vite/`
   - Uruchom `npm run build` ponownie
