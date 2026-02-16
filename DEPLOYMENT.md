# Instrukcja wdrożenia aplikacji Grójec na Cito

## 1. Konfiguracja bazy danych Supabase

### Baza danych jest już skonfigurowana!

Aplikacja używa w pełni skonfigurowanej bazy danych Supabase z następującymi tabelami:

- `pharmacies` - apteki i godziny otwarcia
- `pharmacy_hours` - godziny pracy aptek
- `waste_areas` - obszary odbioru odpadów (miasto/wieś)
- `waste_schedules` - harmonogram odbioru odpadów
- `bus_schedules` - rozkład jazdy autobusów
- `bus_delay_reports` - zgłoszenia opóźnień autobusów
- `parishes` - parafie
- `mass_schedules` - harmonogram mszy świętych
- `mass_schedule_exceptions` - wyjątki w harmonogramie mszy
- `calendar_settings` - ustawienia kalendarza

### Row Level Security (RLS)

Wszystkie tabele mają włączone RLS z następującymi zasadami:

- **Odczyt (SELECT)**: Dostępny publicznie dla wszystkich użytkowników (rola `anon`)
- **Zapis (INSERT/UPDATE/DELETE)**: Tylko dla zalogowanych użytkowników (rola `authenticated`)

## 2. Zmienne środowiskowe

### Lokalne środowisko (.env)

Zmienne są już skonfigurowane w pliku `.env`:

```
VITE_SUPABASE_URL=https://nleukmxdcpkualqnyclg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Netlify - Konfiguracja zmiennych

Aby wdrożyć aplikację na Netlify, musisz dodać następujące zmienne środowiskowe:

1. Zaloguj się do Netlify Dashboard
2. Wybierz swoją aplikację
3. Przejdź do **Site settings** → **Environment variables**
4. Dodaj następujące zmienne:

| Nazwa zmiennej | Wartość |
|----------------|---------|
| `VITE_SUPABASE_URL` | `https://nleukmxdcpkualqnyclg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXVrbXhkY3BrdWFscW55Y2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTExMDgsImV4cCI6MjA4NjU2NzEwOH0.IwYSU7qulGX-Cr2dvwNQsYtdwDOYXFcl7owUN_mrhQg` |

## 3. Konfiguracja konta administratora

### Tworzenie konta administratora w Supabase

Panel administracyjny używa Supabase Authentication z email/hasło.

**WAŻNE**: Tylko użytkownik z emailem `grojecnacito@gmail.com` ma dostęp do panelu administracyjnego.

#### Krok 1: Utwórz konto w Supabase Dashboard

1. Przejdź do [Supabase Dashboard](https://supabase.com/dashboard/project/nleukmxdcpkualqnyclg)
2. Kliknij **Authentication** → **Users**
3. Kliknij **Add user** → **Create new user**
4. Wprowadź dane:
   - **Email**: `grojecnacito@gmail.com`
   - **Password**: [wybierz bezpieczne hasło - zapisz je!]
   - **Auto Confirm User**: Zaznacz (aby pominąć weryfikację email)
5. Kliknij **Create user**

#### Krok 2: Wyłącz Email Confirmation (opcjonalne)

Aby umożliwić natychmiastowe logowanie bez potwierdzania emaila:

1. W Supabase Dashboard przejdź do **Authentication** → **Settings**
2. Znajdź sekcję **Email Auth**
3. Wyłącz opcję **Enable email confirmations**
4. Zapisz zmiany

### Logowanie do panelu administracyjnego

1. Przejdź do `https://twoja-domena.com/admin`
2. Wprowadź:
   - **Email**: `grojecnacito@gmail.com`
   - **Hasło**: [hasło ustawione w Supabase]
3. Kliknij **Zaloguj się**

## 4. Bezpieczeństwo

### Polityki RLS zapewniają:

- ✅ Publiczny dostęp do odczytu wszystkich danych (rozkłady, apteki, odpady, msze)
- ✅ Tylko zalogowani użytkownicy mogą modyfikować dane
- ✅ Zgłoszenia opóźnień autobusów są dostępne dla wszystkich (crowdsourcing)
- ✅ Admin może zarządzać wszystkimi danymi po zalogowaniu

### Najlepsze praktyki:

- Używaj silnego hasła dla konta administratora
- Nigdy nie udostępniaj danych logowania
- Regularnie sprawdzaj logi w Supabase Dashboard
- W razie potrzeby zmień hasło w **Authentication** → **Users** → **Edit user**

## 5. Wdrożenie na Netlify

### Automatyczne wdrożenie:

1. Połącz repozytorium GitHub z Netlify
2. Ustaw następujące ustawienia Build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Dodaj zmienne środowiskowe (patrz sekcja 2)
4. Kliknij **Deploy site**

### Ręczne wdrożenie:

```bash
# Zbuduj aplikację
npm run build

# Wdróż folder dist na Netlify przez CLI lub Dashboard
```

## 6. Testowanie

### Po wdrożeniu sprawdź:

- ✅ Strona główna ładuje się poprawnie
- ✅ Moduły (Autobusy, Apteki, Odpady, Nabożeństwa) wyświetlają dane
- ✅ Panel administratora `/admin` wymaga logowania
- ✅ Zalogowany administrator może edytować dane
- ✅ Użytkownicy mogą zgłaszać opóźnienia autobusów

## 7. Zarządzanie danymi

### Aktualizacja danych przez panel administracyjny:

Po zalogowaniu do `/admin` możesz zarządzać:

- **Apteki**: Dodawanie/edycja aptek i godzin otwarcia
- **Autobusy**: Zarządzanie rozkładami jazdy, symbolami kursowania
- **Odpady**: Harmonogramy odbioru dla ulic i wsi
- **Nabożeństwa**: Godziny mszy, parafie, wyjątki (święta)
- **Kalendarz**: Dni wolne od pracy, święta

### Bezpośrednia edycja w Supabase:

Możesz również edytować dane bezpośrednio w [Supabase Dashboard](https://supabase.com/dashboard/project/nleukmxdcpkualqnyclg):

1. Przejdź do **Table Editor**
2. Wybierz tabelę (np. `bus_schedules`)
3. Edytuj/dodaj/usuń rekordy

## 8. Wsparcie

W razie problemów:

- Sprawdź logi w Supabase Dashboard → **Logs**
- Sprawdź logi w Netlify Dashboard → **Deploys** → **Deploy log**
- Skontaktuj się: grojecnacito@gmail.com

---

**Data utworzenia**: 2026-02-14
**Wersja**: 1.0.0
