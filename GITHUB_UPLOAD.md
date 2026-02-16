# Jak wgrać projekt na GitHub

Wszystkie pliki są gotowe do wgrania na GitHub, włącznie z:
- ✅ 25 migracji bazy danych Supabase
- ✅ Wszystkie komponenty aplikacji
- ✅ Konfiguracja i dokumentacja
- ✅ Najnowsze poprawki bezpieczeństwa

## Opcja 1: Masz już repozytorium na GitHub

Jeśli już stworzyłeś repozytorium na GitHub, użyj tych komend:

```bash
# Dodaj remote do swojego repozytorium (zamień URL na swoje)
git remote add origin https://github.com/TWOJA-NAZWA/NAZWA-REPO.git

# Wyślij wszystkie pliki
git push -u origin main --force
```

**UWAGA**: `--force` nadpisze to co jest teraz w repozytorium. Jeśli masz tam coś ważnego, usuń `--force` i rozwiąż ewentualne konflikty.

## Opcja 2: Jeszcze nie masz repozytorium

1. **Stwórz nowe repozytorium na GitHub:**
   - Wejdź na https://github.com/new
   - Podaj nazwę, np. `grojec-na-cito`
   - **NIE** zaznaczaj "Initialize with README" (mamy już pliki)
   - Kliknij "Create repository"

2. **Połącz lokalne repo z GitHub:**
   ```bash
   # GitHub pokaże Ci te komendy - użyj URL ze swojego repo
   git remote add origin https://github.com/TWOJA-NAZWA/NAZWA-REPO.git
   git push -u origin main
   ```

## Opcja 3: Używasz GitHub Desktop

1. Otwórz GitHub Desktop
2. Kliknij "Add" > "Add existing repository"
3. Wybierz folder projektu
4. Kliknij "Publish repository"
5. Wybierz nazwę i czy ma być publiczne czy prywatne
6. Kliknij "Publish"

## Co zostanie wgrane

Wszystkie pliki poza:
- ❌ `node_modules/` (ignorowane)
- ❌ `dist/` (ignorowane)
- ❌ `.env` (ignorowane - to WAŻNE dla bezpieczeństwa!)
- ❌ Logi (ignorowane)

## Ważne: Plik .env

**NIE** wgrywaj pliku `.env` na GitHub! Jest on w `.gitignore` i zawiera tajne klucze. Jeśli ktoś będzie klonował repozytorium, będzie musiał:

1. Skopiować `.env.example` (jeśli go stworzymy) do `.env`
2. Wypełnić własnymi kluczami Supabase

## Weryfikacja

Po wgraniu, sprawdź na GitHub czy widzisz:
- ✅ Folder `supabase/migrations/` z 25 plikami SQL
- ✅ Folder `src/` z komponentami
- ✅ Pliki dokumentacji (README.md, SECURITY_FIXES.md, itp.)
- ✅ Pliki konfiguracyjne (package.json, vite.config.ts, itp.)

## Potrzebujesz pomocy?

Jeśli napotkasz problemy:
1. Sprawdź czy masz skonfigurowane uwierzytelnianie GitHub (SSH lub Personal Access Token)
2. Sprawdź czy nazwa repozytorium jest poprawna
3. Użyj `git remote -v` żeby zobaczyć skonfigurowane remote
4. Użyj `git status` żeby zobaczyć status plików

## Następne kroki po wgraniu

Po wgraniu na GitHub:
1. Ustaw branch protection rules dla `main`
2. Dodaj GitHub Actions dla CI/CD (opcjonalnie)
3. Skonfiguruj automatyczne deploymenty
4. Dodaj collaboratorów jeśli pracujesz w zespole
