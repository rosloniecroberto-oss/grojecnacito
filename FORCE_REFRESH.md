# Jak wyczyścić stary cache i zobaczyć świeże dane

## Problem został naprawiony:
1. ✅ Service Worker teraz nie cache'uje bundle'ów JavaScript
2. ✅ Supabase API nigdy nie jest cache'owane
3. ✅ index.html zawsze jest pobierany na świeżo
4. ✅ Filtrowanie zgłoszeń opóźnień po dacie (ostatnie 60 min)

## Jak wyczyścić stary cache w przeglądarce:

### Chrome/Edge:
1. Otwórz DevTools (F12)
2. Zakładka **Application** → **Storage**
3. Kliknij **Clear site data**
4. Zaznacz wszystko i kliknij **Clear site data**
5. Zamknij i otwórz kartę na nowo (CTRL+SHIFT+T)

### Firefox:
1. Otwórz DevTools (F12)
2. Zakładka **Storage**
3. Kliknij prawym na **Service Workers** → **Unregister**
4. Kliknij prawym na każdy **Cache Storage** → **Delete**
5. CTRL+F5 (hard refresh)

### Safari:
1. Safari → Preferences → Advanced → Show Develop menu
2. Develop → Empty Caches
3. CTRL+R (refresh)

## Lub po prostu:
**CTRL+SHIFT+DELETE** → Wyczyść cache i pliki cookies → Potwierdź

## Po wyczyszczeniu:
- Strona pobierze nowy Service Worker (v4)
- Bundle JavaScript będzie zawsze świeży
- Dane z Supabase będą aktualne w czasie rzeczywistym
- Zgłoszenia opóźnień będą pokazywać tylko ostatnie 60 minut

## Weryfikacja:
Otwórz DevTools → Console i sprawdź czy widzisz:
```
Service Worker: grojec-cito-v4-fresh-2026-02-14
```

Jeśli widzisz starszą wersję (v3 lub wcześniejszą), wykonaj hard refresh: **CTRL+SHIFT+R**
