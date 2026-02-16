# Instrukcja importu rozkładu jazdy autobusów

## 🚌 Metoda 1: Automatyczny import z HTML (zalecane)

### Krok 1: Pobierz plik HTML
1. Otwórz stronę PKS Grójec: https://www.pksgrojec.pl/rozklad_new/
2. Znajdź rozkład dla przystanku "Grójec"
3. Kliknij prawym przyciskiem → "Zapisz jako..." → wybierz format "Strona internetowa, tylko HTML"
4. Zapisz jako `src/Tabliczka_ASG_HTML.html`

### Krok 2: Zainstaluj zależności (jednorazowo)
```bash
npm install jsdom
```

### Krok 3: Uruchom parser
```bash
node parse_bus_schedule.mjs
```

### Krok 4: Sprawdź i zaimportuj
Skrypt utworzy plik `generated_bus_schedules.sql`. Możesz:
- Skopiować zawartość do nowej migracji Supabase
- Lub wykonać bezpośrednio przez Supabase SQL editor

---

## 📝 Metoda 2: Ręczne wprowadzanie

### Format SQL:
```sql
INSERT INTO bus_schedules (route_type, destination, departure_time, via, symbols, days_filter) VALUES
('PKS', 'BIAŁOBRZEGI P.D. UL. POŚWIĘTNA', '06:00', 'JASIENIEC II', 'DU', 'WORKDAYS'),
('PKS', 'WARSZAWA Dw.Zach. PKS', '07:40', 'GŁUCHÓW, TARCZYN', 'SU', 'WORKDAYS');
```

### Struktura tabeli:
- **route_type**: 'PKS' lub 'MZK'
- **destination**: Kierunek docelowy
- **departure_time**: Godzina odjazdu (format: HH:MM)
- **via**: Trasa "przez" (opcjonalnie)
- **symbols**: Symbole kursu (D, U, S, C itp.)
- **days_filter**: Dni kursowania:
  - `WORKDAYS` - dni robocze
  - `SATURDAYS` - soboty
  - `SUNDAYS_HOLIDAYS` - niedziele i święta
  - Można łączyć przecinkiem: `WORKDAYS,SATURDAYS`

### Mapa symboli → days_filter:
- **D, DU, SU, MU, DeU, S, M** → `WORKDAYS`
- **C, CdU, CMU** → `SATURDAYS,SUNDAYS_HOLIDAYS`
- **7GU** → `SUNDAYS_HOLIDAYS`
- **U, d, dmU** → `WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS`
- **6dU, D6dU, D6h** → `SATURDAYS` lub `WORKDAYS,SATURDAYS`
- **dU, MCdU** → `WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS`

---

## 📊 Weryfikacja danych

Po imporcie sprawdź w aplikacji:
```sql
SELECT destination, COUNT(*) as courses
FROM bus_schedules
WHERE route_type = 'PKS'
GROUP BY destination
ORDER BY destination;
```

Sprawdź przykładowe kursy:
```sql
SELECT destination, departure_time, via, symbols, days_filter
FROM bus_schedules
WHERE route_type = 'PKS'
ORDER BY destination, departure_time
LIMIT 20;
```

---

## 🛠️ Rozwiązywanie problemów

### Problem: Nieprawidłowe kodowanie znaków
Jeśli widzisz krzaki zamiast polskich znaków, HTML musi być w kodowaniu `windows-1250` (latin1).

### Problem: Brakujące kursy
Sprawdź czy HTML zawiera pełną tabelę rozkładu. Niektóre strony ładują dane dynamicznie przez JavaScript.

### Problem: Nieprawidłowe days_filter
Jeśli symbol nie jest rozpoznany, skrypt użyje domyślnego `WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS`. Możesz ręcznie poprawić w SQL.

---

## 💡 Wskazówki

1. **Używaj gotowego pliku**: Jeśli `import_all_buses.sql` już zawiera dane, możesz je zaimportować bezpośrednio
2. **Aktualizacje**: Przy zmianie rozkładu pobierz nowy HTML i uruchom parser ponownie
3. **Backup**: Przed importem zrób backup istniejących danych:
   ```sql
   -- Export przed usunięciem
   SELECT * FROM bus_schedules WHERE route_type = 'PKS';
   ```
