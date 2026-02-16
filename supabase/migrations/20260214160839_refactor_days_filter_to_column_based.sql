/*
  # Refaktoryzacja days_filter do reprezentacji kolumn rozkładu

  1. Zmiany w tabeli bus_schedules
    - Zmiana znaczenia kolumny days_filter na określenie kolumny rozkładu
    - Usunięcie kolumn runs_on_workdays, runs_on_saturdays, runs_on_sundays_holidays
    - Nowe wartości days_filter:
      * 'WORKDAYS' - kurs w kolumnie "Dni robocze"
      * 'SATURDAYS' - kurs w kolumnie "Soboty"
      * 'SUNDAYS_HOLIDAYS' - kurs w kolumnie "Niedziele i święta"
      * Kombinacje oddzielone przecinkiem (np. 'WORKDAYS,SATURDAYS')
  
  2. Logika
    - days_filter określa w jakiej kolumnie PDF jest kurs
    - symbols zawiera dokładnie symbole z PDF (D, S, M, C, Ca, pmh, d, 6, 7G, itp.)
    - Filtrowanie sprawdza najpierw days_filter (czy kurs jest na ten typ dnia)
    - Potem sprawdza symbols (czy symbole nie wykluczają kursu)
*/

-- Usunięcie starych kolumn
ALTER TABLE bus_schedules DROP COLUMN IF EXISTS runs_on_workdays;
ALTER TABLE bus_schedules DROP COLUMN IF EXISTS runs_on_saturdays;
ALTER TABLE bus_schedules DROP COLUMN IF EXISTS runs_on_sundays_holidays;

-- Usunięcie starego ograniczenia
ALTER TABLE bus_schedules DROP CONSTRAINT IF EXISTS bus_schedules_days_filter_check;

-- Nowe ograniczenie dla days_filter
ALTER TABLE bus_schedules ADD CONSTRAINT bus_schedules_days_filter_check 
  CHECK (days_filter ~ '^(WORKDAYS|SATURDAYS|SUNDAYS_HOLIDAYS)(,(WORKDAYS|SATURDAYS|SUNDAYS_HOLIDAYS))*$');

COMMENT ON COLUMN bus_schedules.days_filter IS 'Określa w jakiej kolumnie rozkładu jest kurs: WORKDAYS (dni robocze), SATURDAYS (soboty), SUNDAYS_HOLIDAYS (niedziele i święta), lub kombinacje oddzielone przecinkiem';
COMMENT ON COLUMN bus_schedules.symbols IS 'Symbole z rozkładu PDF (D, S, M, C, Ca, pmh, d, 6, 7G, itp.) - dokładnie jak w oryginalnym rozkładzie';