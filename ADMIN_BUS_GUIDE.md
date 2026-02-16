# 📋 Instrukcja obsługi panelu administracyjnego - Autobusy

## 🎯 Nowe funkcje

Panel admina dla autobusów został całkowicie przeprojektowany dla łatwiejszego zarządzania dużą liczbą kursów (221+).

### ✨ Dostępne funkcje:

1. **Widok tabelaryczny** - kompaktowy widok wszystkich kursów
2. **Sortowanie** - po każdej kolumnie (godzina, kierunek, typ, dni)
3. **Filtrowanie** - szybkie wyszukiwanie + filtry dropdown
4. **Paginacja** - 50 kursów na stronę dla lepszej wydajności
5. **Zaznaczanie wielu** - masowe operacje (usuń zaznaczone)
6. **Eksport CSV** - pobierz dane do Excela
7. **Przełączanie widoku** - tabela ↔ karty

---

## 📊 Widok tabelaryczny

### Nawigacja w tabeli
- **Przewijanie poziome** - przesuń tabelę w prawo/lewo aby zobaczyć wszystkie kolumny
- **Przyklejone kolumny** - Checkboxy (lewa) i Akcje (prawa) zawsze widoczne
- **Przyklejony nagłówek** - nagłówki kolumn widoczne przy przewijaniu w dół
- **Cienie** - pokazują gdzie są przyklejone kolumny

### Sortowanie
Kliknij nagłówek kolumny aby posortować:
- **Godzina** - chronologicznie (domyślnie)
- **Kierunek** - alfabetycznie
- **Typ** - PKS przed BUSY
- **Dni** - alfabetycznie

Kliknij ponownie aby odwrócić kierunek sortowania (↑/↓).

### Kolumny tabeli:
| Kolumna | Opis |
|---------|------|
| ☑️ | Checkbox do zaznaczania kursów |
| **Typ** | PKS lub BUSY |
| **Godzina** | Godzina odjazdu (HH:MM) |
| **Kierunek** | Stacja docelowa |
| **Przez** | Trasa pośrednia (opcjonalnie) |
| **Dni** | WORKDAYS, SATURDAYS, itp. |
| **Symbole** | DU, SU, CdU itp. |
| **Akcje** | Przyciski edycji/usuwania |

---

## 🔍 Filtrowanie

### 1. Wyszukiwanie tekstowe
Szukaj po:
- Kierunku (np. "Warszawa")
- Trasie "przez" (np. "Tarczyn")
- Symbolu (np. "DU")
- Godzinie (np. "08:00")

### 2. Filtr typu
- **Wszystkie typy** - pokazuje PKS + BUSY
- **PKS** - tylko kursy PKS
- **BUSY** - tylko kursy BUSY

### 3. Filtr kierunku
Dropdown ze wszystkimi 36 kierunkami.
Wybierz konkretny kierunek aby zobaczyć tylko jego kursy.

### Przykład użycia:
1. Wybierz kierunek: "Warszawa Dw.Zach. PKS"
2. Wpisz w wyszukiwarkę: "06:"
3. Zobaczysz tylko kursy do Warszawy o godzinie 06:xx

---

## ✅ Masowe operacje

### Zaznaczanie kursów:
1. **Pojedyncze** - kliknij checkbox przy kursie
2. **Wszystkie na stronie** - kliknij checkbox w nagłówku tabeli
3. **Wielu kursów** - zaznacz kolejne checkboxy

Po zaznaczeniu kursów pojawią się dwa przyciski:

### 1. Edytuj zaznaczone (X) - NOWOŚĆ! ✨
Masowa edycja wybranych pól w wielu kursach jednocześnie.

**Jak używać:**
1. Zaznacz kursy do edycji
2. Kliknij "Edytuj zaznaczone (X)"
3. W oknie masowej edycji **zaznacz checkboxy** przy polach, które chcesz zmienić
4. Wypełnij tylko te pola, które chcesz zaktualizować
5. Kliknij "Zapisz zmiany"

**Jakie pola można edytować:**
- ✏️ Kierunek (np. naprawa literówki "Waraszawa" → "Warszawa")
- ✏️ Przez/trasa (np. zmiana przystanków pośrednich)
- ✏️ Typ kursu (PKS ↔ BUSY)
- ✏️ Dni kursowania (np. zmiana z roboczych na wszystkie dni)
- ✏️ Symbole (np. dodanie symbolu DU do wszystkich)

**Ważne:** Tylko zaznaczone pola zostaną zmienione! Reszta danych pozostanie bez zmian.

**Przykład użycia - naprawa literówki:**
1. Wyszukaj "Waraszawa" (kurs z błędem)
2. Zaznacz wszystkie znalezione kursy
3. Kliknij "Edytuj zaznaczone (5)"
4. Zaznacz checkbox przy polu "Kierunek"
5. Wpisz: "Warszawa"
6. Kliknij "Zapisz zmiany"
7. ✅ Wszystkie 5 kursów ma teraz poprawny kierunek, a godziny, dni i symbole pozostały niezmienione

**Przykład użycia - aktualizacja trasy:**
1. Filtruj po kierunku: "Warszawa"
2. Zaznacz wszystkie kursy przez Tarczyn
3. Kliknij "Edytuj zaznaczone"
4. Zaznacz checkbox przy "Przez"
5. Wpisz nową trasę: "Tarczyn, Pniewy, Warka"
6. Zapisz

### 2. Usuń zaznaczone (X)
Masowe usuwanie wybranych kursów.

**Jak używać:**
1. Zaznacz kursy do usunięcia
2. Kliknij "Usuń zaznaczone (X)"
3. Potwierdź operację

⚠️ **Uwaga:** Usunięcie jest trwałe! Nie ma cofania.

### Typowe scenariusze:
- **Naprawa literówek w wielu kursach:**
  1. Wyszukaj błędny tekst
  2. Zaznacz wszystkie znalezione
  3. Edytuj zaznaczone → popraw pole

- **Zmiana typu kursu PKS → BUSY:**
  1. Filtruj po kierunku
  2. Zaznacz kursy do zmiany
  3. Edytuj zaznaczone → zmień typ na BUSY

- **Usuwanie całego kierunku:**
  1. Filtruj po kierunku
  2. Zaznacz wszystkie (checkbox w nagłówku)
  3. Usuń zaznaczone

- **Aktualizacja trasy dla wielu kursów:**
  1. Zaznacz kursy tego samego kierunku
  2. Edytuj zaznaczone → zmień pole "Przez"
  3. Wszystkie kursy będą miały nową trasę

---

## 📥 Eksport CSV

### Jak wyeksportować:
1. Kliknij przycisk **"Eksport CSV"** (zielony, góra)
2. Plik zostanie pobrany: `rozkład-jazdy-YYYY-MM-DD.csv`

### Co zawiera eksport:
- Typ kursu
- Kierunek
- Godzina odjazdu
- Trasa przez
- Dni kursowania
- Symbole
- Status odwołania

### Edycja w Excelu:
1. Otwórz CSV w Excel/LibreOffice
2. Wprowadź zmiany
3. Zapisz
4. Możesz użyć parsera (`parse-buses`) do re-importu

---

## 🔄 Przełączanie widoku

### Widok tabeli (domyślny)
- Kompaktowy
- Sortowanie po kolumnach
- Najlepszy dla dużej liczby kursów
- 50 kursów na stronę

### Widok kart
- Bardziej szczegółowy
- Lepszy dla przeglądu pojedynczych kursów
- Pokazuje parsowane symbole

**Przełącznik:** Przycisk "Karty" / "Tabela" obok "Eksport CSV"

---

## ⚙️ Akcje na kursach

Dla każdego kursu dostępne są:

| Ikona | Akcja | Opis |
|-------|-------|------|
| 🗑️ | Wyczyść zgłoszenia | Usuń zgłoszenia opóźnień (jeśli są) |
| 🚫 | Odwołaj/Przywróć | Oznacz kurs jako odwołany |
| ✏️ | Edytuj | Otwórz formularz edycji |
| 🗑️ | Usuń | Usuń kurs na zawsze |

---

## 📄 Paginacja

- **50 kursów** na stronę
- Nawigacja: "Poprzednia" / "Następna"
- Licznik: "Strona X z Y"
- Po zastosowaniu filtrów paginacja resetuje się do strony 1

---

## 💡 Wskazówki

### Szybka edycja kierunku:
1. Filtruj po kierunku
2. Zobaczysz wszystkie kursy tego kierunku
3. Edytuj pojedyncze kursy

### Sprawdzanie duplikatów:
1. Sortuj po: Kierunek → Godzina
2. Przewiń listę szukając identycznych wpisów
3. Zaznacz i usuń duplikaty

### Przeglądanie kursów porannych:
1. Sortuj po godzinie (↑)
2. Pierwsze strony zawierają najwcześniejsze kursy

### Znajdź kursy do konkretnego miasta:
1. Wpisz nazwę miasta w wyszukiwarkę
2. Lub użyj filtra kierunku

---

## 🚀 Workflow masowej edycji

### Scenariusz: Aktualizacja rozkładu
1. **Eksportuj CSV** - zapisz kopię zapasową
2. **Usuń stare kursy** - zaznacz wszystkie kierunki do aktualizacji
3. **Import nowych danych** - użyj `parse-buses` lub dodaj ręcznie
4. **Weryfikacja** - użyj `verify-buses` do sprawdzenia

### Scenariusz: Korekta błędów
1. **Filtruj** po problemowym kierunku
2. **Sortuj** po godzinie
3. **Edytuj** pojedyncze kursy z błędami
4. **Sprawdź** wynik w aplikacji

---

## 📊 Statystyki

Panel pokazuje:
- **X z Y kursów** - liczba po filtrach / łącznie
- **Licznik zaznaczonych** - na przycisku usuwania
- **Numer strony** - w paginacji

---

## ⚠️ Uwagi bezpieczeństwa

- **Backup przed masowym usuwaniem** - eksportuj CSV
- **Potwierdź operacje** - system pyta przed usunięciem
- **Brak "undo"** - usunięcia są trwałe
- **Sprawdź filtry** - przed masową edycją upewnij się co zaznaczasz
