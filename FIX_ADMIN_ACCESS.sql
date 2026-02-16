-- =====================================================
-- FIX ADMIN ACCESS - Skrypt naprawczy dla admina
-- =====================================================
--
-- Ten skrypt:
-- 1. Ustawia rolę 'admin' w app_metadata dla użytkownika grojecnacito@gmail.com
-- 2. Sprawdza czy policy są poprawnie skonfigurowane
-- 3. Wyświetla potwierdzenie
--
-- INSTRUKCJA:
-- 1. Otwórz Supabase Dashboard
-- 2. Przejdź do SQL Editor
-- 3. Wklej cały ten skrypt
-- 4. Kliknij "Run"
-- =====================================================

-- KROK 1: Ustaw rolę admin w app_metadata
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) ||
  '{"role": "admin"}'::jsonb
WHERE email = 'grojecnacito@gmail.com';

-- KROK 2: Sprawdź czy zmiana się powiodła
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

-- KROK 3: Sprawdź policy dla kluczowych tabel
SELECT
  schemaname,
  tablename,
  policyname,
  'OK - Policy istnieje' as status
FROM pg_policies
WHERE tablename IN ('bus_schedules', 'pharmacies', 'pharmacy_hours', 'emergency_alerts')
  AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- =====================================================
-- KONIEC SKRYPTU
-- =====================================================
--
-- Po wykonaniu tego skryptu:
-- 1. Wyloguj się z panelu admina
-- 2. Zaloguj się ponownie
-- 3. Spróbuj zapisać zmiany
--
-- Jeśli nadal nie działa, sprawdź w przeglądarce Console (F12)
-- czy pojawiają się błędy związane z RLS policies
-- =====================================================
