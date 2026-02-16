/*
  # Utworzenie tabeli ustawień kalendarza

  1. Nowa tabela
    - `calendar_settings`
      - `id` (uuid, primary key) - zawsze używamy stałego ID
      - `force_holiday_mode` (boolean) - wymusza tryb świąteczny/wolny
      - `force_break_mode` (boolean) - wymusza tryb feryjny/wakacyjny
      - `updated_at` (timestamptz) - data ostatniej aktualizacji
  
  2. Bezpieczeństwo
    - Włącz RLS
    - Tylko użytkownicy authenticated mogą czytać
    - Tylko admin może aktualizować (w przyszłości po dodaniu ról)
  
  3. Notatki
    - Tabela zawiera tylko jeden wiersz z ustawieniami globalnymi
    - Ustawienia są odczytywane przez frontend przy każdym renderze modułu autobusów
*/

CREATE TABLE IF NOT EXISTS calendar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  force_holiday_mode boolean DEFAULT false,
  force_break_mode boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read calendar settings"
  ON calendar_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update calendar settings"
  ON calendar_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM calendar_settings) THEN
    INSERT INTO calendar_settings (force_holiday_mode, force_break_mode)
    VALUES (false, false);
  END IF;
END $$;