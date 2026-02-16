# Instrukcja naprawy dostępu administratora

## Problem
Panel admina na Netlify nie zapisuje zmian w bazie danych.

## Przyczyna
Wszystkie RLS policies w Supabase sprawdzają, czy użytkownik ma rolę `admin` w `app_metadata`, ale Twoje konto użytkownika prawdopodobnie nie ma tej roli ustawionej.

## Rozwiązanie

### KROK 1: Ustaw rolę admin w Supabase

1. Otwórz **Supabase Dashboard**: https://app.supabase.com
2. Wybierz swój projekt
3. Przejdź do **SQL Editor** (ikona z lewej strony)
4. Wklej zawartość pliku `FIX_ADMIN_ACCESS.sql`:

```sql
-- Ustaw rolę admin
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) ||
  '{"role": "admin"}'::jsonb
WHERE email = 'grojecnacito@gmail.com';

-- Sprawdź czy zmiana się powiodła
SELECT
  id,
  email,
  raw_app_meta_data ->> 'role' as admin_role,
  CASE
    WHEN raw_app_meta_data ->> 'role' = 'admin' THEN '✓ ADMIN USTAWIONY POPRAWNIE'
    ELSE '✗ BŁĄD: Brak roli admin'
  END as status
FROM auth.users
WHERE email = 'grojecnacito@gmail.com';
```

5. Kliknij **"Run"** (lub naciśnij Ctrl+Enter)
6. Sprawdź wynik - powinieneś zobaczyć: `✓ ADMIN USTAWIONY POPRAWNIE`

### KROK 2: Wyloguj się i zaloguj ponownie

1. Przejdź do panelu admina na Netlify: `https://twoja-domena.netlify.app/admin`
2. Kliknij **"Wyloguj"**
3. Zaloguj się ponownie używając:
   - Email: `grojecnacito@gmail.com`
   - Hasło: (twoje hasło)

### KROK 3: Przetestuj zapis

1. Spróbuj dodać lub edytować jakiekolwiek dane (np. aptekę, kurs autobusowy)
2. Jeśli pojawi się błąd, sprawdź konsolę przeglądarki (F12 → Console)
3. Błąd powinien być teraz wyświetlony również na ekranie w czerwonym bannerze

## Co zostało naprawione w kodzie

### ✅ Dodano obsługę błędów
Wszystkie komponenty administracyjne mają teraz pełną obsługę błędów:
- **EmergencyAlertsAdmin** - alerty awaryjne
- **PharmaciesAdmin** - apteki i godziny otwarcia
- **BusesAdmin** - kursy autobusowe (w tym masowa edycja)

### ✅ Wyświetlanie komunikatów błędów
Każdy błąd zapisu jest teraz:
- Logowany w konsoli przeglądarki (dla debugowania)
- Wyświetlany użytkownikowi w czerwonym bannerze
- Zawiera dokładny komunikat błędu z Supabase
- Można zamknąć klikając ✕

### ✅ Dodano plik `_redirects` dla Netlify
- Panel admina nie zwróci już 404 przy odświeżaniu strony
- Routing SPA działa prawidłowo na Netlify

## Weryfikacja uprawnień

Aby sprawdzić czy masz uprawnienia admina, wykonaj to zapytanie w SQL Editor:

```sql
SELECT
  email,
  raw_app_meta_data ->> 'role' as role,
  raw_user_meta_data
FROM auth.users
WHERE email = 'grojecnacito@gmail.com';
```

Powinieneś zobaczyć:
- `role: "admin"` ✓
- **NIE** `role: null` ✗

## Bezpieczeństwo

### ⚠️ Ważne informacje o `app_metadata` vs `user_metadata`

- **`app_metadata`** - Może być edytowane TYLKO przez administratorów (bezpieczne)
- **`user_metadata`** - Może być edytowane przez użytkowników (NIE używamy tego do ról!)

Wszystkie RLS policies zostały zaktualizowane aby sprawdzać `app_metadata`, co jest bezpiecznym rozwiązaniem.

## Dodatkowe wskazówki

### Jeśli nadal nie działa:

1. **Sprawdź sesję użytkownika:**
   - Otwórz Console przeglądarki (F12)
   - Wpisz: `await supabase.auth.getSession()`
   - Sprawdź czy `session.user.app_metadata.role === 'admin'`

2. **Sprawdź RLS policies:**
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('bus_schedules', 'pharmacies', 'pharmacy_hours', 'emergency_alerts')
   ORDER BY tablename, policyname;
   ```

3. **Wymuszenie nowej sesji:**
   - Wyloguj się
   - Wyczyść cookies dla domeny Netlify
   - Zaloguj się ponownie

## Pomoc techniczna

Jeśli problem nadal występuje, zbierz następujące informacje:
1. Dokładny komunikat błędu z czerwonego banneru
2. Logi z Console przeglądarki (F12 → Console)
3. Wynik zapytania SQL sprawdzającego uprawnienia
4. Tabela i operacja która nie działa (INSERT/UPDATE/DELETE)

---

**Autor:** Zespół Grójec na Cito
**Data:** 15.02.2026
**Status:** ✅ Gotowe do wdrożenia
