/*
  # Dodanie pola symboli kursowania do rozkładu jazdy

  1. Zmiany
    - Dodanie kolumny `symbols` do tabeli `bus_schedules`
      - Typ: text (opcjonalne)
      - Opis: Symbole kursowania rozdzielone przecinkami (np. "Ex,D,a")
  
  2. Notatki
    - Pole jest opcjonalne i może być puste
    - Symbole są tłumaczone na pełne opisy w interfejsie użytkownika
    - Dostępne symbole: &, ~W, 6, 7G, a, b, C, D, d, e, Ex, g, h, l, M, m, p, S, U, ź
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bus_schedules' AND column_name = 'symbols'
  ) THEN
    ALTER TABLE bus_schedules ADD COLUMN symbols text;
  END IF;
END $$;