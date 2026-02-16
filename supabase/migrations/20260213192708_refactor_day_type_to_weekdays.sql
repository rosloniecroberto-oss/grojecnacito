/*
  # Refaktoryzacja day_type na konkretne dni tygodnia
  
  ## Opis zmian
  Zmiana z ogólnego podziału (powszedni/sobota/niedziela/święto) na konkretne dni tygodnia (poniedziałek-niedziela).
  
  ## Szczegóły
  
  1. **Nowy typ danych**
     - Tworzony nowy typ enum `day_of_week_type` z wartościami: monday, tuesday, wednesday, thursday, friday, saturday, sunday, holiday
  
  2. **Migracja danych**
     - Każde nabożeństwo oznaczone jako 'weekday' zostanie skopiowane 5 razy (Pon-Pt)
     - Nabożeństwa 'saturday' zostaną zmienione na 'saturday'
     - Nabożeństwa 'sunday' zostaną zmienione na 'sunday'
     - Nabożeństwa 'holiday' zostaną zmienione na 'holiday'
  
  3. **Struktura tabeli**
     - Kolumna `day_type` zmieniona na nowy typ enum
     - Wszystkie istniejące dane zachowane i przekonwertowane
  
  ## Uwagi
     - Migracja zachowuje wszystkie istniejące nabożeństwa
     - Dane dla dni powszednich są automatycznie powielane dla każdego dnia Pon-Pt
     - Zachowana kompatybilność z RLS policies
*/

-- Create new enum type for specific days of week
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'day_of_week_type') THEN
    CREATE TYPE day_of_week_type AS ENUM (
      'monday',
      'tuesday', 
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'holiday'
    );
  END IF;
END $$;

-- Create temporary table to store old data
CREATE TEMP TABLE temp_mass_schedules AS
SELECT * FROM mass_schedules;

-- Delete all existing mass schedules (we'll recreate them)
DELETE FROM mass_schedules;

-- Add new column with new type
ALTER TABLE mass_schedules 
ADD COLUMN IF NOT EXISTS day_of_week day_of_week_type;

-- Migrate data: weekday entries -> create 5 copies (Mon-Fri)
INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'weekday',
  'monday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'weekday';

INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'weekday',
  'tuesday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'weekday';

INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'weekday',
  'wednesday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'weekday';

INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'weekday',
  'thursday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'weekday';

INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'weekday',
  'friday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'weekday';

-- Migrate saturday entries
INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'saturday',
  'saturday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'saturday';

-- Migrate sunday entries
INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'sunday',
  'sunday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'sunday';

-- Migrate holiday entries
INSERT INTO mass_schedules (id, parish_id, day_type, day_of_week, time, title, is_periodic, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  parish_id,
  'holiday',
  'holiday'::day_of_week_type,
  time,
  title,
  is_periodic,
  duration_minutes,
  created_at
FROM temp_mass_schedules
WHERE day_type = 'holiday';

-- Now drop the old day_type column and rename day_of_week to day_type
ALTER TABLE mass_schedules DROP COLUMN IF EXISTS day_type;
ALTER TABLE mass_schedules RENAME COLUMN day_of_week TO day_type;

-- Make sure day_type is not null
ALTER TABLE mass_schedules ALTER COLUMN day_type SET NOT NULL;