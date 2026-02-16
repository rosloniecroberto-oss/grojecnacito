/*
  # Dodanie pola "Przez" (przystanki) do rozkładu jazdy

  1. Zmiany
    - Dodanie kolumny `via` do tabeli `bus_schedules`
      - Typ: text (opcjonalne)
      - Opis: Lista przystanków pośrednich przez które przejeżdża autobus
  
  2. Notatki
    - Pole jest opcjonalne i może być puste
    - Używane do wyświetlenia pełnej trasy przejazdu w module autobusów
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bus_schedules' AND column_name = 'via'
  ) THEN
    ALTER TABLE bus_schedules ADD COLUMN via text;
  END IF;
END $$;