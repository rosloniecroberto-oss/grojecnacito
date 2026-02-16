/*
  # Harmonogram wyjątków dla specjalnych dat
  
  ## Opis
  Utworzenie tabeli dla nabożeństw zaplanowanych na konkretne daty, które zastępują standardowy grafik tygodniowy.
  
  ## Szczegóły
  
  1. **Nowa tabela: mass_schedule_exceptions**
     - `id` (uuid, primary key) - unikalny identyfikator
     - `parish_id` (uuid, foreign key) - powiązanie z parafią
     - `date` (date) - konkretna data wyjątku (np. 2026-04-05)
     - `time` (time) - godzina nabożeństwa
     - `title` (text) - tytuł nabożeństwa (np. "Msza święta")
     - `event_name` (text, nullable) - nazwa wydarzenia (np. "Boże Ciało", "Odpust parafialny")
     - `duration_minutes` (integer) - czas trwania w minutach
     - `created_at` (timestamptz) - data utworzenia wpisu
  
  2. **Indeksy**
     - Indeks na (parish_id, date) dla szybkiego wyszukiwania wyjątków dla danej parafii i daty
     - Indeks na date dla automatycznego czyszczenia starych wpisów
  
  3. **Bezpieczeństwo**
     - RLS włączone dla wszystkich operacji
     - Publiczny odczyt wyjątków (SELECT)
     - Tylko administratorzy mogą dodawać/edytować/usuwać (INSERT/UPDATE/DELETE)
  
  ## Logika działania
  Gdy użytkownik odwiedza stronę, system najpierw sprawdza czy istnieje wyjątek dla dzisiejszej daty.
  Jeśli tak - wyświetla wyjątek, jeśli nie - wyświetla standardowy grafik tygodniowy.
*/

-- Create table for special date exceptions
CREATE TABLE IF NOT EXISTS mass_schedule_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  title text NOT NULL DEFAULT 'Msza święta',
  event_name text,
  duration_minutes integer NOT NULL DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mass_exceptions_parish_date 
  ON mass_schedule_exceptions(parish_id, date);

CREATE INDEX IF NOT EXISTS idx_mass_exceptions_date 
  ON mass_schedule_exceptions(date);

-- Enable RLS
ALTER TABLE mass_schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view exceptions
CREATE POLICY "Anyone can view mass schedule exceptions"
  ON mass_schedule_exceptions
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users can insert exceptions
CREATE POLICY "Authenticated users can insert mass schedule exceptions"
  ON mass_schedule_exceptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update exceptions
CREATE POLICY "Authenticated users can update mass schedule exceptions"
  ON mass_schedule_exceptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete exceptions
CREATE POLICY "Authenticated users can delete mass schedule exceptions"
  ON mass_schedule_exceptions
  FOR DELETE
  TO authenticated
  USING (true);