# Lista kontrolna debugowania problemu ze starymi danymi

## ✅ NAPRAWIONE w kodzie:

1. **Service Worker** - Zmieniono cache na `v4-fresh-2026-02-14`
   - Teraz NIE cache'uje bundle'ów JS/CSS
   - NIE cache'uje index.html
   - NIE cache'uje Supabase API
   - Cache tylko manifest.json

2. **BusModule.tsx** - Filtrowanie zgłoszeń opóźnień
   - Pobierane tylko raporty z ostatnich 60 minut
   - `gte('reported_at', sixtyMinutesAgo)`

3. **BusesAdmin.tsx** - Filtrowanie w panelu admina
   - Tak samo jak w BusModule - tylko ostatnie 60 min

4. **index.html** - Dodano meta tagi no-cache
   - `Cache-Control: no-cache, no-store, must-revalidate`
   - `Pragma: no-cache`
   - `Expires: 0`

## 🔍 INSTRUKCJA DEBUGOWANIA:

### KROK 1: Otwórz DevTools (F12)

W zakładce **Console** sprawdź:
```
SW: Installing grojec-cito-v4-fresh-2026-02-14
SW: Activating grojec-cito-v4-fresh-2026-02-14
SW: Cleaning old caches: [...]
```

Jeśli widzisz starszą wersję → przejdź do KROK 2

### KROK 2: Wyczyść Service Worker

**Chrome/Edge:**
1. F12 → Application → Service Workers
2. Kliknij **Unregister** przy wszystkich worker'ach
3. Application → Storage → **Clear site data**
4. Zamknij i otwórz kartę na nowo

**Firefox:**
1. F12 → Storage → Service Workers
2. Kliknij prawym → **Unregister**
3. CTRL+SHIFT+R (hard refresh)

### KROK 3: Sprawdź zapytania do Supabase

W zakładce **Network**:
1. Filtr: Fetch/XHR
2. Odśwież stronę
3. Znajdź zapytanie do `bus_schedules`
4. Sprawdź odpowiedź (Response tab)

**Oczekiwany wynik:** Dane z Twojej bazy Supabase

**Jeśli widzisz stare dane:**
- Sprawdź czy zapytanie idzie do właściwego URL Supabase (sprawdź .env)
- Sprawdź Headers → powinno być `apikey: your-anon-key`

### KROK 4: Sprawdź zgłoszenia opóźnień

1. W Console wpisz:
```javascript
await fetch('YOUR_SUPABASE_URL/rest/v1/bus_delay_reports?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json())
```

2. Powinieneś zobaczyć tylko raporty z ostatnich 60 minut

### KROK 5: Sprawdź localStorage

W Console wpisz:
```javascript
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});
```

**Oczekiwany wynik:**
- `cookieConsent` - zgoda na cookies
- `wasteAreaType` - typ obszaru (city/village)
- `selectedWasteArea` - wybrany obszar
- `visitCount` - licznik odwiedzin

**NIE powinno być:**
- Żadnych danych o autobusach
- Żadnych danych o zgłoszeniach
- Żadnych "bus_delay_*" kluczy

## 🚨 UWAGA:

Jeśli po wykonaniu wszystkich kroków nadal widzisz stare dane:

1. Sprawdź czy używasz właściwego URL Supabase w `.env`:
   ```
   VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
   VITE_SUPABASE_ANON_KEY=twoj-klucz
   ```

2. Sprawdź w Supabase Dashboard czy dane faktycznie są w bazie

3. Sprawdź RLS policies - czy pozwalają na odczyt dla anon users

## 📝 Dodatkowe narzędzia:

### Test Supabase connection:
Dodaj to do Console:
```javascript
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('bus_schedules').select('*');
console.log('Supabase data:', data, 'error:', error);
```

### Wymuś reload bez cache:
- Chrome: CTRL+SHIFT+R lub CTRL+F5
- Firefox: CTRL+SHIFT+R
- Safari: CMD+SHIFT+R

### Incognito Mode:
Otwórz stronę w trybie incognito - jeśli tam działa, to problem jest w cache
