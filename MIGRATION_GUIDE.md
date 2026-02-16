# Instrukcja migracji do nowego projektu Supabase

## Przegląd

Ten dokument zawiera szczegółową instrukcję przeniesienia aplikacji **Grójec na Cito** na nowy projekt Supabase.

## Plik migracji

Cały skrypt SQL znajduje się w pliku: **`complete_migration.sql`**

Ten plik zawiera:
- ✅ Wszystkie tabele (DDL) z pełną strukturą
- ✅ Wszystkie dane aplikacji (INSERT statements)
- ✅ Polityki RLS (SELECT dla wszystkich, INSERT/UPDATE/DELETE tylko dla grojecnacito@gmail.com)
- ✅ Indeksy dla wydajności
- ✅ Funkcje pomocnicze

---

## Krok 1: Utwórz nowy projekt Supabase

1. Przejdź do [supabase.com/dashboard](https://supabase.com/dashboard)
2. Kliknij **"New Project"**
3. Wypełnij formularz:
   - **Name**: Grójec na Cito
   - **Database Password**: [wybierz silne hasło - zapisz je!]
   - **Region**: Europe (closest to Poland)
4. Kliknij **"Create new project"**
5. Poczekaj na utworzenie projektu (1-2 minuty)

---

## Krok 2: Uruchom skrypt SQL

1. W dashboardzie nowego projektu przejdź do **SQL Editor** (lewa kolumna)
2. Kliknij **"New query"**
3. Otwórz plik `complete_migration.sql` w edytorze tekstu
4. Skopiuj **całą zawartość** pliku
5. Wklej do SQL Editor w Supabase
6. Kliknij **"Run"** (lub Ctrl+Enter)
7. Sprawdź czy pojawił się komunikat **"Success. No rows returned"**

### Weryfikacja struktury

Przejdź do **Table Editor** i sprawdź czy wszystkie tabele zostały utworzone:
- ✅ pharmacies
- ✅ pharmacy_hours
- ✅ waste_areas
- ✅ waste_schedules
- ✅ bus_schedules
- ✅ bus_delay_reports
- ✅ parishes
- ✅ mass_schedules
- ✅ mass_schedule_exceptions
- ✅ calendar_settings
- ✅ admin_settings

---

## Krok 3: Utwórz konto administratora

1. W dashboardzie przejdź do **Authentication** → **Users**
2. Kliknij **"Add user"** → **"Create new user"**
3. Wypełnij formularz:
   - **Email**: `grojecnacito@gmail.com`
   - **Password**: [wybierz bezpieczne hasło - zapisz je!]
   - **Auto Confirm User**: ✅ ZAZNACZ (aby pominąć weryfikację email)
4. Kliknij **"Create user"**

### Wyłącz Email Confirmation (opcjonalne)

Aby umożliwić natychmiastowe logowanie:

1. Przejdź do **Authentication** → **Settings**
2. Znajdź sekcję **Email Auth**
3. Wyłącz **"Enable email confirmations"**
4. Zapisz zmiany

---

## Krok 4: Pobierz nowe klucze API

1. W dashboardzie przejdź do **Settings** (ikona koła zębatego) → **API**
2. Znajdź sekcję **Project API keys**
3. Skopiuj następujące wartości:

```
Project URL: https://[twoj-projekt-id].supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Krok 5: Zaktualizuj zmienne środowiskowe w aplikacji

### Plik `.env` (lokalnie)

Otwórz plik `.env` w katalogu projektu i zaktualizuj:

```env
VITE_SUPABASE_URL=https://[TWOJ-NOWY-PROJEKT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[TWOJ-NOWY-KLUCZ]
```

### Netlify (wdrożenie produkcyjne)

1. Zaloguj się do Netlify Dashboard
2. Wybierz swoją aplikację **Grójec na Cito**
3. Przejdź do **Site settings** → **Environment variables**
4. Zaktualizuj następujące zmienne:

| Nazwa zmiennej | Nowa wartość |
|----------------|--------------|
| `VITE_SUPABASE_URL` | `https://[TWOJ-NOWY-PROJEKT-ID].supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[TWOJ-NOWY-KLUCZ]` |

5. Kliknij **"Save"**
6. Wdróż aplikację ponownie (**Deploys** → **"Trigger deploy"**)

---

## Krok 6: Testowanie aplikacji

### Lokalnie

```bash
# Uruchom aplikację lokalnie
npm run dev
```

Sprawdź:
- ✅ Strona główna ładuje się poprawnie
- ✅ Moduły (Autobusy, Apteki, Odpady, Nabożeństwa) wyświetlają dane
- ✅ Panel administratora `/admin` wymaga logowania
- ✅ Możesz zalogować się jako grojecnacito@gmail.com
- ✅ Po zalogowaniu możesz edytować dane

### Na produkcji (Netlify)

1. Przejdź do `https://twoja-domena.netlify.app`
2. Sprawdź wszystkie moduły
3. Przejdź do `/admin`
4. Zaloguj się jako `grojecnacito@gmail.com`
5. Przetestuj edycję danych

---

## Pliki, które NIE wymagają zmian

Następujące pliki **NIE** wymagają żadnych zmian w kodzie:

- ✅ `/src/lib/supabase.ts` - używa zmiennych środowiskowych
- ✅ `/src/components/*.tsx` - wszystkie komponenty
- ✅ Wszystkie inne pliki TypeScript/React

Aplikacja automatycznie odczyta nowe klucze z pliku `.env` (lokalnie) lub ze zmiennych środowiskowych Netlify (produkcja).

---

## Weryfikacja RLS (Row Level Security)

### Test odczytu publicznego

Wyloguj się z panelu admina i sprawdź:
- ✅ Strona główna działa
- ✅ Wszystkie moduły wyświetlają dane
- ✅ Możesz zgłaszać opóźnienia autobusów

### Test zapisu administratora

Zaloguj się jako `grojecnacito@gmail.com` i sprawdź:
- ✅ Możesz dodawać/edytować apteki
- ✅ Możesz dodawać/edytować autobusy
- ✅ Możesz dodawać/edytować odpady
- ✅ Możesz dodawać/edytować msze
- ✅ Możesz zarządzać kalendarzem

### Test zabezpieczeń

Spróbuj edytować dane **bez logowania**:
- ❌ Powinien pojawić się błąd (brak uprawnień)
- ✅ Odczyt danych powinien działać

---

## Rozwiązywanie problemów

### Problem: "Invalid API key"

**Rozwiązanie:**
- Sprawdź czy skopiowałeś **anon public key** (NIE service_role key)
- Upewnij się, że klucz nie zawiera spacji ani znaków nowej linii
- Zrestartuj serwer deweloperski (`npm run dev`)

### Problem: "Row-level security policy violation"

**Rozwiązanie:**
- Upewnij się, że jesteś zalogowany jako `grojecnacito@gmail.com`
- Sprawdź czy polityki RLS zostały poprawnie utworzone w SQL Editor
- Zweryfikuj w Supabase Dashboard → **Authentication** → **Policies**

### Problem: Brak danych w tabelach

**Rozwiązanie:**
- Sprawdź w **Table Editor** czy dane zostały wstawione
- Uruchom ponownie skrypt SQL z sekcji INSERT
- Sprawdź logi w **Logs** (prawa kolumna w dashboardzie)

### Problem: Nie mogę się zalogować do panelu admina

**Rozwiązanie:**
- Sprawdź czy użytkownik `grojecnacito@gmail.com` istnieje w **Authentication** → **Users**
- Upewnij się, że użytkownik ma status **"Confirmed"**
- Zresetuj hasło w dashboardzie Supabase

---

## Backup starej bazy (opcjonalne)

Jeśli chcesz zachować backup starej bazy danych:

1. W **starym** projekcie Supabase przejdź do **Database** → **Backups**
2. Kliknij **"Create backup"**
3. Poczekaj na utworzenie backupu
4. Możesz go pobrać lub zachować w Supabase

---

## Podsumowanie

Po wykonaniu wszystkich kroków:

✅ Masz nowy projekt Supabase z pełną strukturą bazy
✅ Wszystkie dane zostały przeniesione
✅ RLS zabezpiecza dane (odczyt publiczny, zapis tylko dla admina)
✅ Aplikacja działa lokalnie i na Netlify
✅ Panel administratora wymaga logowania

---

## Wsparcie

W razie problemów:

- Sprawdź logi w Supabase: **Logs** → **Postgres Logs**
- Sprawdź logi w Netlify: **Deploys** → [wybierz deploy] → **Deploy log**
- Skontaktuj się: grojecnacito@gmail.com

---

**Data utworzenia**: 2026-02-14
**Wersja**: 1.0.0
