/*
  # Poprawka kombinacji days_filter + symbols
  
  1. Problem
    - Podczas importu z HTML niektóre kombinacje dni i symboli zostały błędnie zinterpretowane
    - Np. "6" + "CdU" powinno być "C" + "dU"
    - Np. "S" + "SU" powinno być "S" + "U"
  
  2. Rozwiązanie
    - Rozdzielenie kodów dni od symboli dodatkowych
    - Kody dni: D, S, 6, 7G, C, M, D6, MC, SC
    - Symbole: U, Ex, d, e, m, a, b, h, l, p, g, &, ł, ~W, ph, pl
  
  3. Poprawki
    - '6' + 'CdU' → 'C' + 'dU'
    - '6' + 'CMU' → 'C' + 'MU'
    - '6' + 'CD' → 'C' + 'D'
    - '6' + 'Ca' → 'C' + 'a'
    - '6' + 'CbU' → 'C' + 'bU'
    - '6' + 'C' → 'C' + ''
    - '7G' + analogiczne kombinacje z 'C'
    - 'D' + '6X' → 'D6' + 'X'
    - 'D' + 'MU' → 'M' + 'U'
    - '6'/'7G' + 'MCdU' → 'MC' + 'dU'
    - '6'/'7G' + 'SCbU' → 'SC' + 'bU'
    - '6'/'7G' + 'SCpl' → 'SC' + 'pl'
    - '6'/'7G' + 'bSC' → 'SC' + 'b'
    - 'S' + 'SU' → 'S' + 'U'
    - '6' + '6h' → '6' + 'h'
*/

-- Poprawka 1: '6'/'7G' + symbole z 'C' na początku → 'C' + symbol bez 'C'
UPDATE bus_schedules 
SET days_filter = 'C', symbols = SUBSTRING(symbols FROM 2) 
WHERE days_filter IN ('6', '7G') AND symbols LIKE 'C%' AND symbols != 'CD';

UPDATE bus_schedules 
SET days_filter = 'C', symbols = 'D' 
WHERE days_filter IN ('6', '7G') AND symbols = 'CD';

-- Poprawka 2: 'D' + '6X' → 'D6' + 'X'
UPDATE bus_schedules 
SET days_filter = 'D6', symbols = SUBSTRING(symbols FROM 2) 
WHERE days_filter = 'D' AND symbols LIKE '6%';

-- Poprawka 3: 'D' + 'MU' → 'M' + 'U'
UPDATE bus_schedules 
SET days_filter = 'M', symbols = 'U' 
WHERE days_filter = 'D' AND symbols = 'MU';

-- Poprawka 4: '6'/'7G' + 'MCdU' → 'MC' + 'dU'
UPDATE bus_schedules 
SET days_filter = 'MC', symbols = 'dU' 
WHERE days_filter IN ('6', '7G') AND symbols = 'MCdU';

-- Poprawka 5: '6'/'7G' + 'SC...' → 'SC' + '...'
UPDATE bus_schedules 
SET days_filter = 'SC', symbols = 'bU' 
WHERE days_filter IN ('6', '7G') AND symbols = 'SCbU';

UPDATE bus_schedules 
SET days_filter = 'SC', symbols = 'pl' 
WHERE days_filter IN ('6', '7G') AND symbols = 'SCpl';

UPDATE bus_schedules 
SET days_filter = 'SC', symbols = 'b' 
WHERE days_filter IN ('6', '7G') AND symbols = 'bSC';

-- Poprawka 6: 'S' + 'SU' → 'S' + 'U'
UPDATE bus_schedules 
SET symbols = 'U' 
WHERE days_filter = 'S' AND symbols = 'SU';

-- Poprawka 7: '6' + '6h' → '6' + 'h'
UPDATE bus_schedules 
SET symbols = 'h' 
WHERE days_filter = '6' AND symbols = '6h';
