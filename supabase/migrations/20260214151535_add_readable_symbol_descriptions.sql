/*
  # Dodanie czytelnych opisów symboli kursowania
  
  1. Zmiany
    - Dodanie pomocniczej funkcji do generowania czytelnych opisów
    - Aktualizacja danych aby mieć spójną strukturę
    
  2. Struktura symboli
    - `days_filter`: główny typ dni (D, S, 6, 7G, C, M, MC)
    - `symbols`: dodatkowe modyfikatory (U, e, d, m, Ex, ~W, a, b, g, h, l, p)
    
  3. Mapowanie dni
    - D = dni robocze (pon-pt)
    - S = dni nauki szkolnej  
    - 6 = soboty
    - 7G = niedziele giełdowe
    - C = weekendy i święta
    - M = okres ferii
    - MC = weekendy w okresie ferii
*/

-- Najpierw wyczyść błędne dane gdzie symbole są w złym formacie
-- Napraw kursy gdzie days_filter zawiera "D" ale symbols zawiera "DU", "SU", etc.

-- Przypadek 1: symbols = "DU" → days_filter = "D", symbols = "U"
UPDATE bus_schedules
SET symbols = 'U'
WHERE symbols = 'DU' AND days_filter = 'D';

-- Przypadek 2: symbols = "SU" → days_filter = "S", symbols = "U"  
UPDATE bus_schedules
SET symbols = 'U'
WHERE symbols = 'SU' AND days_filter = 'D';

UPDATE bus_schedules
SET symbols = 'U', days_filter = 'S'
WHERE symbols = 'SU' AND days_filter = 'S';

-- Przypadek 3: symbols = "DeU" → days_filter = "D", symbols = "eU"
UPDATE bus_schedules
SET symbols = 'eU'
WHERE symbols = 'DeU' AND days_filter = 'D';

-- Przypadek 4: symbols = "dU" z days_filter "D" → sprawdź czy to sobota/niedziela
-- Kursy z "dU" w kolumnie soboty/niedziele  
UPDATE bus_schedules
SET symbols = 'dU'
WHERE symbols IN ('6dU', '7GdU') AND days_filter = 'D';

-- Przypadek 5: Napraw "MCdU" i podobne
UPDATE bus_schedules
SET symbols = 'dU'
WHERE symbols = 'MCdU' AND days_filter IN ('D', 'MC');

-- Przypadek 6: Napraw symbole z literką C
UPDATE bus_schedules
SET symbols = REPLACE(symbols, 'MC', 'M')
WHERE days_filter = 'MC';

UPDATE bus_schedules
SET symbols = REPLACE(symbols, 'SC', 'S')
WHERE days_filter = 'MC';

UPDATE bus_schedules
SET symbols = REPLACE(symbols, 'C', '')
WHERE days_filter = 'C' AND symbols LIKE '%C%';

-- Przypadek 7: Napraw "SSU" → "SU"
UPDATE bus_schedules
SET symbols = 'U', days_filter = 'S'
WHERE symbols = 'SSU';

-- Przypadek 8: Napraw kursy z kodami dni w symbols zamiast days_filter
UPDATE bus_schedules
SET 
  days_filter = CASE
    WHEN symbols LIKE '7G%' THEN '7G'
    WHEN symbols LIKE '6%' THEN '6'
    WHEN symbols LIKE 'M%' THEN 'M'
    WHEN symbols LIKE 'C%' THEN 'C'
    WHEN symbols LIKE 'S%' THEN 'S'
    ELSE days_filter
  END,
  symbols = CASE
    WHEN symbols LIKE '7G%' THEN SUBSTRING(symbols FROM 3)
    WHEN symbols LIKE '6%' THEN SUBSTRING(symbols FROM 2)
    WHEN symbols LIKE 'M%' THEN SUBSTRING(symbols FROM 2)
    WHEN symbols LIKE 'C%' THEN SUBSTRING(symbols FROM 2)
    WHEN symbols LIKE 'S%' THEN SUBSTRING(symbols FROM 2)
    ELSE symbols
  END
WHERE symbols ~ '^(7G|6|M|C|S)' AND days_filter = 'D';

-- Usuń puste symbole
UPDATE bus_schedules
SET symbols = NULL
WHERE symbols = '';
