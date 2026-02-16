/*
  # Dodanie kolumn dla dni tygodnia do rozkładu autobusów

  1. Zmiany w tabeli bus_schedules
    - Dodanie `runs_on_workdays` (boolean) - czy kurs kursuje w dni robocze
    - Dodanie `runs_on_saturdays` (boolean) - czy kurs kursuje w soboty
    - Dodanie `runs_on_sundays_holidays` (boolean) - czy kurs kursuje w niedziele i święta
    - Usunięcie ograniczenia na days_filter (będzie używane tylko dla symboli typu D/S/M/C)
  
  2. Uwagi
    - Kolumny dni tygodnia określają w jakich dniach kurs jest w rozkładzie
    - Symbole (D, S, M, C itp.) działają jako dodatkowe filtry wykluczające
    - Kurs może być np. w "soboty" ale symbol "D" wykluczy go w soboty
*/

-- Dodanie nowych kolumn
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bus_schedules' AND column_name = 'runs_on_workdays'
  ) THEN
    ALTER TABLE bus_schedules ADD COLUMN runs_on_workdays boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bus_schedules' AND column_name = 'runs_on_saturdays'
  ) THEN
    ALTER TABLE bus_schedules ADD COLUMN runs_on_saturdays boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bus_schedules' AND column_name = 'runs_on_sundays_holidays'
  ) THEN
    ALTER TABLE bus_schedules ADD COLUMN runs_on_sundays_holidays boolean DEFAULT false;
  END IF;
END $$;

-- Usunięcie starego ograniczenia na days_filter
ALTER TABLE bus_schedules DROP CONSTRAINT IF EXISTS bus_schedules_days_filter_check;

-- Pozwalamy na pusty string w days_filter (będzie używane tylko dla symboli)
ALTER TABLE bus_schedules ADD CONSTRAINT bus_schedules_days_filter_check 
  CHECK (days_filter ~ '^[DSM6C7G]*$' AND length(days_filter) <= 10);