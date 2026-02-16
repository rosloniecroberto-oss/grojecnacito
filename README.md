# Grójec na Cito

Zaawansowana aplikacja PWA dla mieszkańców Grójca - wszystko co ważne w jednym miejscu.

## Funkcjonalności

### 1. Moduł Apteki
- Wyświetlanie listy aptek z godzinami otwarcia
- Priorytet dla Apteki Papaya 2 (dyżur całodobowy 2026)
- Status w czasie rzeczywistym: Czynne/Zamknięte
- Pulsujący status dla apteki dyżurnej po 21:00, w niedziele i święta

### 2. Moduł Odpady
- Dualna wyszukiwarka: Miasto (ulice) / Wieś (miejscowości)
- Pamięć wyboru w localStorage
- **Hero Card**: Wielka, czytelna karta z ikoną odpadu pokazująca najbliższy odbiór
- Dynamiczne kolory i gradienty dla różnych typów odpadów
- Pełny harmonogram w akkordionie

### 3. Moduł Autobusy
- Rozkład jazdy PKS i BUSY z Dworca Laskowa
- **Inteligentne formatowanie czasu**: "Za 5 min" / "Za ok. 2h" / "Za 1h 30min"
- Crowdsourcing: zgłaszanie opóźnień i braków busów
- **Toast notification**: Potwierdzenie zgłoszenia z komunikatem "Dziękujemy!"
- **Wizualne wskazanie**: Przyciski zmieniają kolor po kliknięciu
- **Tło karty**: Pomarańczowe/czerwone tło przy alertach
- System alertów: 1 zgłoszenie = status pomarańczowy, 3+ = czerwony alert

### 4. Moduł Nabożeństwa
- Harmonogramy dla 3 parafii (św. Mikołaja Biskupa, Miłosierdzia Bożego, Worów)
- Wyświetlanie tylko najbliższego wydarzenia dla każdej parafii
- **Lepsze formatowanie czasu**: Automatyczne "Za ok. 2h" dla odległych wydarzeń
- Statusy: "WKRÓTCE" (< 30min, pulsujący), "W TRAKCIE" (do 60min po starcie)

### 5. Inteligentny Kalendarz
- Rozpoznawanie wszystkich polskich świąt w 2026
- System fall-back: dla dni świątecznych bez danych wyświetla harmonogram niedzielny
- Możliwość dodawania wyjątków (overrides) dla konkretnych dat

### 6. System alertów awaryjnych
- **Sticky banner** na górze strony z ważnymi komunikatami
- Stonowany kolor ostrzegawczy (amber) z białym tekstem
- Ikona alertu dla szybkiego rozpoznania
- Automatyczne odświeżanie w czasie rzeczywistym
- Widoczny tylko gdy administrator go aktywuje
- Idealny do komunikatów o: zmianach godzin, utrudnieniach, odwołanych wydarzeniach

### 7. Panel Administratora
- Dostęp: `/admin` (hasło: 123)
- **Wewnętrzne widoki CRUD**: Pełne zarządzanie danymi bez opuszczania aplikacji
- **Apteki**: Dodawaj, edytuj, usuwaj apteki i godziny otwarcia
- **Autobusy**:
  - Zaawansowane zarządzanie rozkładem jazdy (221+ kursów)
  - Możliwość odwoływania kursów
  - **Masowa edycja**: Zaznacz wiele kursów i edytuj wybrane pola jednocześnie
  - Filtrowanie, sortowanie, paginacja (50/strona)
  - Eksport do CSV
  - Przełączanie widoków: tabela ↔ karty
- **Odpady**: Zarządzaj obszarami (miasto/wieś) i harmonogramami odbioru
- **Nabożeństwa**: Zarządzaj parafiami i harmonogramami mszy
- **Alerty awaryjne**:
  - Twórz komunikaty ostrzegawcze
  - Przełącznik "Pokaż na stronie" aktywuje banner
  - Edycja i archiwizacja alertów
  - Podgląd statusu (aktywny/nieaktywny)
- Licznik odwiedzin (privacy-friendly)
- Intuicyjne formularze w modalach

## Stack Technologiczny

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL, RLS)
- **PWA**: Service Worker, Manifest
- **API**: Open-Meteo (pogoda dla Grójca)

## Struktura Bazy Danych

### Tabele:
- `pharmacies` - apteki
- `pharmacy_hours` - godziny otwarcia aptek
- `waste_areas` - obszary (ulice/miejscowości)
- `waste_schedules` - harmonogramy odbioru odpadów
- `bus_schedules` - rozkład jazdy busów
- `bus_reports` - zgłoszenia opóźnień/braków
- `parishes` - parafie
- `mass_schedules` - harmonogramy nabożeństw
- `event_overrides` - wyjątki w harmonogramach
- `admin_settings` - ustawienia (licznik odwiedzin, banery)
- `emergency_alerts` - alerty awaryjne na stronie głównej

## Konfiguracja

1. Skonfiguruj zmienne środowiskowe w `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom w trybie deweloperskim:
```bash
npm run dev
```

4. Zbuduj dla produkcji:
```bash
npm run build
```

## Funkcje PWA

- Tryb offline dzięki Service Worker
- Instalacja na ekranie głównym urządzenia
- Manifest z ikonami i metadanymi
- Cache strategia dla lepszej wydajności

## Design

- Ultra-minimalizm, zaokrąglone rogi (rounded-2xl)
- Dużo przestrzeni (white-space)
- Responsywność: mobile-first
- Dostępność: wysokie kontrasty, czytelne fonty

## Administracja

Panel administracyjny dostępny pod adresem `/admin`:
- Hasło: `123`
- **Wbudowane widoki CRUD** dla wszystkich modułów:
  - **Apteki**: Dodawaj apteki, edytuj dane kontaktowe, oznaczaj apteki dyżurne
  - **Autobusy**: Pełne zarządzanie rozkładem, odwoływanie kursów jednym kliknięciem
  - **Odpady**: Zarządzaj obszarami i harmonogramami dla każdego typu odpadu
  - **Nabożeństwa**: Dodawaj parafie i harmonogramy mszy
- Intuicyjne modalne formularze z walidacją
- Widok dashboard z statystykami
- Podgląd licznika odwiedzin
- **Wszystkie dane gotowe do eksportu** do produkcji Supabase

## Licencja

2026 - Projekt Społeczny
