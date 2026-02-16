# Jak wysłać pliki na GitHub - SZYBKI PRZEWODNIK

## Problem
Projekt ma commit lokalnie, ale nie ma połączenia z GitHub.

## Rozwiązanie

### OPCJA 1: Masz już URL repozytorium GitHub

Jeśli wiesz jaki jest URL Twojego repozytorium na GitHub (np. widziałeś "synced to github"):

```bash
# Zamień URL na swoje repozytorium
git remote add origin https://github.com/TWOJA-NAZWA/TWOJE-REPO.git

# Wyślij wszystkie pliki
git push -u origin main
```

**UWAGA**: Jeśli dostaniesz błąd, że remote już istnieje, użyj:
```bash
git remote set-url origin https://github.com/TWOJA-NAZWA/TWOJE-REPO.git
git push -u origin main
```

### OPCJA 2: Musisz stworzyć nowe repozytorium

1. **Na GitHub:**
   - Wejdź: https://github.com/new
   - Nazwa: np. `grojec-na-cito`
   - **NIE** zaznaczaj "Initialize with README"
   - Kliknij "Create repository"

2. **W terminalu:**
   ```bash
   # GitHub pokaże Ci te komendy - użyj URL ze swojego repo
   git remote add origin https://github.com/TWOJA-NAZWA/grojec-na-cito.git
   git push -u origin main
   ```

### OPCJA 3: Force push (jeśli repozytorium ma konflikty)

Jeśli masz już coś w repozytorium GitHub i chcesz to nadpisać:

```bash
git remote add origin https://github.com/TWOJA-NAZWA/TWOJE-REPO.git
git push -u origin main --force
```

⚠️ **UWAGA**: `--force` usunie wszystko co jest teraz w repozytorium!

## Sprawdzenie czy zadziałało

Po `git push` powinieneś zobaczyć:
```
Counting objects: 102, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (XX/XX), done.
Writing objects: 100% (102/102), done.
```

Następnie sprawdź na GitHub czy widzisz:
- ✅ 102 pliki
- ✅ Folder `supabase/migrations/` z 25 plikami SQL
- ✅ Wszystkie komponenty w `src/`

## Co jest gotowe do wysłania

Commit zawiera:
- ✅ **102 pliki**
- ✅ **18,688 linii kodu**
- ✅ **25 migracji Supabase**
- ✅ **Wszystkie komponenty React**
- ✅ **Pełna dokumentacja**

## Jeśli masz problemy

**Błąd: "authentication failed"**
```bash
# Użyj Personal Access Token zamiast hasła
# Stwórz token: https://github.com/settings/tokens
```

**Błąd: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/TWOJA-NAZWA/TWOJE-REPO.git
```

**Chcesz sprawdzić co jest w commicie:**
```bash
git show --stat
```

## Następne kroki

Po wysłaniu możesz:
1. Sprawdzić repozytorium na GitHub
2. Skonfigurować GitHub Pages (jeśli chcesz)
3. Dodać collaboratorów
4. Ustawić branch protection

## WAŻNE: Bezpieczeństwo

✅ Plik `.env` z kluczami **NIE** jest w commicie (jest w .gitignore)
✅ Zamiast tego jest `.env.example` z placeholderami
