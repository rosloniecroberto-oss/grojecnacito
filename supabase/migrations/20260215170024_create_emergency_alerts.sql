/*
  # Dodanie systemu alertów awaryjnych

  1. Nowa tabela
    - `emergency_alerts`
      - `id` (uuid, primary key) - unikalny identyfikator alertu
      - `message` (text) - treść komunikatu awaryjnego
      - `is_active` (boolean) - czy alert jest aktywny i widoczny
      - `created_at` (timestamptz) - data utworzenia
      - `updated_at` (timestamptz) - data ostatniej aktualizacji
      - `created_by` (text) - opcjonalnie: kto utworzył alert

  2. Bezpieczeństwo
    - Włączenie RLS na tabeli `emergency_alerts`
    - Publiczny dostęp do odczytu aktywnych alertów (SELECT dla wszystkich)
    - Tylko admini mogą tworzyć, edytować i usuwać alerty (INSERT, UPDATE, DELETE wymagają uwierzytelnienia)

  3. Uwagi
    - Domyślnie nowe alerty są nieaktywne (is_active = false)
    - System będzie wyświetlać tylko jeden alert na raz (najnowszy aktywny)
    - Alert może być łatwo włączany/wyłączany przez administratora
*/

-- Tworzenie tabeli emergency_alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- Włączenie Row Level Security
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Polityka: wszyscy mogą odczytać aktywne alerty
CREATE POLICY "Anyone can view active emergency alerts"
  ON emergency_alerts
  FOR SELECT
  USING (is_active = true);

-- Polityka: admini mogą widzieć wszystkie alerty (aktywne i nieaktywne)
CREATE POLICY "Authenticated users can view all emergency alerts"
  ON emergency_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Polityka: admini mogą dodawać nowe alerty
CREATE POLICY "Authenticated users can insert emergency alerts"
  ON emergency_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Polityka: admini mogą edytować alerty
CREATE POLICY "Authenticated users can update emergency alerts"
  ON emergency_alerts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Polityka: admini mogą usuwać alerty
CREATE POLICY "Authenticated users can delete emergency alerts"
  ON emergency_alerts
  FOR DELETE
  TO authenticated
  USING (true);

-- Dodanie triggera do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_emergency_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER emergency_alerts_updated_at
  BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_emergency_alerts_updated_at();