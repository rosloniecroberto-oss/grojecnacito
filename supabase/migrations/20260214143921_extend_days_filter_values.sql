/*
  # Rozszerzenie wartości days_filter
  
  1. Zmiany
    - Usunięcie starego constraintu days_filter (D, 6, 7G, S)
    - Dodanie nowego constraintu akceptującego wszystkie kombinacje:
      - Pojedyncze: D, S, 6, 7G, C, M
      - Kombinacje: D6, MC, SC, i inne
  
  2. Bezpieczeństwo
    - Constraint zapewnia, że days_filter zawiera tylko poprawne kody
*/

-- Usuń stary constraint
ALTER TABLE bus_schedules 
DROP CONSTRAINT IF EXISTS bus_schedules_days_filter_check;

-- Dodaj nowy, bardziej elastyczny constraint
-- Akceptuje kombinacje liter D, S, M, C oraz cyfr 6, 7 i tekst G
ALTER TABLE bus_schedules 
ADD CONSTRAINT bus_schedules_days_filter_check 
CHECK (days_filter ~ '^[DSM6C7G]+$' AND LENGTH(days_filter) <= 10);
