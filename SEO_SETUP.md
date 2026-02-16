# SEO Configuration Guide

## Overview
Aplikacja została skonfigurowana z kompleksowym SEO i meta tagami dla lepszej widoczności w wyszukiwarkach i social media.

## Skonfigurowane Meta Tagi

### Podstawowe SEO
- **Title**: "Grójec - Informator Miejski, Rozkłady Jazdy, Apteki"
- **Description**: "Najświeższe rozkłady jazdy PKS Grójec, dyżury aptek i ważne komunikaty miejskie w jednej aplikacji"
- **Keywords**: Grójec, PKS Grójec, rozkład jazdy, apteki, dyżur aptek, informator miejski, odpady, wywóz śmieci, nabożeństwa
- **Language**: pl (Polish)
- **Theme Color**: #1e40af (ciemny niebieski, dopasowany do interfejsu)

### Open Graph (Facebook, LinkedIn)
- og:type - "website"
- og:url - https://grojec.pl
- og:title - Dynamiczny tytuł strony
- og:description - Opis strony
- og:image - /og-image.png (1200x630px)
- og:locale - pl_PL
- og:site_name - "Grójec na Cito"

### Twitter Cards
- twitter:card - summary_large_image
- twitter:title - Dynamiczny tytuł
- twitter:description - Opis
- twitter:image - /og-image.png

## Dynamiczne Tytuły

Komponent `SEO.tsx` automatycznie zmienia tytuł strony w zależności od aktywnej zakładki:

- **Strona główna**: "Grójec - Informator Miejski, Rozkłady Jazdy, Apteki"
- **Panel Admin**: "Panel Administracyjny | Grójec na Cito"
- **Polityka Prywatności**: "Polityka Prywatności | Grójec na Cito"

## Wymagane Pliki (Do Dodania)

### 1. Favicon
Umieść plik `favicon.ico` w folderze `/public/`
- Format: ICO lub PNG
- Rozmiary: 16x16, 32x32, 48x48 (multi-size ICO najlepszy)
- Zawartość: Logo lub symbol miasta Grójec

### 2. Open Graph Image
Umieść plik `og-image.png` w folderze `/public/`
- Format: PNG lub JPG
- Rozmiar: **1200x630 pikseli** (wymagane przez Facebook/LinkedIn)
- Zawartość sugerowana:
  - Logo/nazwa "Grójec na Cito"
  - Grafika przedstawiająca kluczowe funkcje (autobus, apteka, kalendarz)
  - Czytelny tekst: "Informator Miejski"
  - Profesjonalny wygląd pasujący do kolorystyki aplikacji

### 3. Apple Touch Icon
Już skonfigurowany: `/public/icon-192.png`
- Sprawdź czy istnieje i ma odpowiednią grafikę

## Testowanie SEO

### Narzędzia do testowania:
1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Wklej URL strony
   - Sprawdź podgląd Open Graph
   - Kliknij "Scrape Again" jeśli edytujesz og:image

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Wklej URL strony
   - Sprawdź podgląd karty

3. **Google Rich Results Test**: https://search.google.com/test/rich-results
   - Sprawdź jak Google widzi stronę

4. **Lighthouse (Chrome DevTools)**
   - Otwórz DevTools (F12)
   - Zakładka Lighthouse
   - Uruchom audit dla SEO

## Jak Dodać Własne Obrazy

### Favicon:
```bash
# Umieść plik w public/
cp your-favicon.ico public/favicon.ico
```

### OG Image:
```bash
# Umieść plik w public/
cp your-og-image.png public/og-image.png
```

Po dodaniu plików:
1. Zbuduj projekt: `npm run build`
2. Przetestuj w Facebook Debugger
3. Wyczyść cache przeglądarki

## Theme Color

Kolor motywu został ustawiony na `#1e40af` (ciemny niebieski):
- Pasuje do głównej kolorystyki aplikacji
- Wyświetla się w pasku adresu na urządzeniach mobilnych (Chrome Android)
- Wyświetla się w oknie PWA

## PWA Support

Aplikacja wspiera Progressive Web App:
- manifest.json jest skonfigurowany
- Service Worker jest aktywny
- Ikony są dostępne (icon-192.png, icon-512.png)

## Checklist Przed Publikacją

- [ ] Dodano favicon.ico do /public/
- [ ] Dodano og-image.png (1200x630px) do /public/
- [ ] Przetestowano w Facebook Debugger
- [ ] Przetestowano w Twitter Card Validator
- [ ] Uruchomiono Lighthouse SEO audit
- [ ] Zweryfikowano działanie dynamicznych tytułów
- [ ] Sprawdzono theme-color na urządzeniu mobilnym
- [ ] Zaktualizowano URL w og:url (jeśli inna domena niż grojec.pl)
