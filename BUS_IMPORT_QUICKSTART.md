# 🚌 Szybki start - Import rozkładu jazdy autobusów

## 📊 Obecny stan bazy
```
✅ 221 kursów PKS w bazie
✅ 36 kierunków
⚠️  1 duplikat wykryty (BIAŁOBRZEGI 16:30)
```

## 🚀 Jak szybko dodać nowe kursy?

### Opcja 1: Ręczne dodanie przez admin panel
Użyj panelu admina w aplikacji (zakładka "Autobusy")

### Opcja 2: Import z HTML (NAJSZYBSZY!)

```bash
# 1. Pobierz plik HTML ze strony PKS
#    https://www.pksgrojec.pl/rozklad_new/tpo_XXXXXX.html
#    Zapisz jako: src/Tabliczka_ASG_HTML.html

# 2. Uruchom parser
npm run parse-buses

# 3. Sprawdź wygenerowany plik
cat generated_bus_schedules.sql

# 4. Wykonaj SQL w Supabase (SQL Editor)
#    lub skopiuj do nowego pliku migracji
```

### Opcja 3: Ręczny SQL
```sql
INSERT INTO bus_schedules (route_type, destination, departure_time, via, symbols, days_filter) VALUES
('PKS', 'WARSZAWA Dw.Zach.', '08:00', 'TARCZYN', 'DU', 'WORKDAYS'),
('PKS', 'BIAŁOBRZEGI', '14:30', NULL, 'SU', 'WORKDAYS');
```

## 🔧 Narzędzia pomocnicze

### Weryfikacja danych w bazie
```bash
npm run verify-buses
```

Pokaże:
- Liczbę kursów
- Wszystkie kierunki
- Statystyki dni kursowania
- Używane symbole
- Duplikaty

### Parser HTML do SQL
```bash
npm run parse-buses
```

Wymaga:
- Plik `src/Tabliczka_ASG_HTML.html` pobrany ze strony PKS
- Generuje `generated_bus_schedules.sql`

## 📖 Szczegóły

Więcej informacji w pliku `BUS_IMPORT_GUIDE.md`:
- Mapa symboli (D, U, S, C) → dni kursowania
- Rozwiązywanie problemów
- Format danych
- Przykłady

## 🔍 Sprawdzanie wyników

Po imporcie odśwież aplikację i sprawdź:
1. Czy kierunki są poprawnie wyświetlane
2. Czy godziny są prawidłowe (format HH:MM)
3. Czy dni kursowania się zgadzają
4. Czy symbole są czytelne

## ⚠️ Ważne

- **Backup przed importem**: Zawsze zrób kopię przed usunięciem danych
- **Sprawdź duplikaty**: Użyj `verify-buses` przed i po imporcie
- **Format czasu**: Godziny MUSZĄ być w formacie HH:MM (np. 06:30, a nie 6:30)
- **Kodowanie**: Plik HTML musi być w `windows-1250` (latin1)
