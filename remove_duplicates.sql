-- Usuń duplikaty z tabeli bus_schedules
-- Zachowaj tylko pierwszy wpis dla każdej unikalnej kombinacji

WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY route_type, destination, departure_time, days_filter
      ORDER BY created_at
    ) as row_num
  FROM bus_schedules
)
DELETE FROM bus_schedules
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Sprawdź wynik
SELECT
  route_type,
  destination,
  departure_time,
  days_filter,
  COUNT(*) as count
FROM bus_schedules
GROUP BY route_type, destination, departure_time, days_filter
HAVING COUNT(*) > 1;
