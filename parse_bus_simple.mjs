#!/usr/bin/env node

/**
 * Prosty parser rozkładu jazdy PKS (bez zależności zewnętrznych)
 *
 * Użycie: node parse_bus_simple.mjs
 */

import fs from 'fs';

const HTML_FILE = 'src/Tabliczka_ASG_HTML.html';
const OUTPUT_FILE = 'generated_bus_schedules.sql';

// Mapa symboli → days_filter (najczęstsze kombinacje)
const SYMBOL_MAP = {
  'D': 'WORKDAYS',
  'DU': 'WORKDAYS',
  'SU': 'WORKDAYS',
  'MU': 'WORKDAYS',
  'DeU': 'WORKDAYS',
  'dU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'C': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'CdU': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'CMU': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'MCdU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  '7GU': 'SUNDAYS_HOLIDAYS',
  'U': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  '6dU': 'SATURDAYS',
  'D6dU': 'WORKDAYS,SATURDAYS',
  'd': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'S': 'WORKDAYS',
  'M': 'WORKDAYS',
};

function escapeSQL(str) {
  return str ? str.replace(/'/g, "''") : '';
}

function symbolToDaysFilter(symbol) {
  if (!symbol) return 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS';
  return SYMBOL_MAP[symbol] || 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS';
}

function parseScheduleTable() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`\n❌ Nie znaleziono pliku: ${HTML_FILE}\n`);
    console.log('📋 Instrukcja:');
    console.log('1. Otwórz: https://www.pksgrojec.pl/rozklad_new/');
    console.log('2. Znajdź rozkład dla Grójca (tpo_XXXXXX.html)');
    console.log('3. Zapisz stronę jako: src/Tabliczka_ASG_HTML.html');
    console.log('4. Upewnij się że plik zawiera pełną tabelę z rozkładem\n');
    process.exit(1);
  }

  const html = fs.readFileSync(HTML_FILE, 'latin1');
  const schedules = [];

  // Najpierw znajdź wszystkie kierunki (nagłówki z bold)
  // Format: <td colspan="X"><b>KIERUNEK</b></td>
  const destinationRegex = /<td[^>]*colspan[^>]*><b>([^<]+)<\/b><\/td>/gi;
  const destinations = [];
  let match;

  while ((match = destinationRegex.exec(html)) !== null) {
    const dest = match[1].trim();
    // Pomijamy nagłówek z PKS i datą
    if (!dest.includes('PKS') && !dest.includes('Rozk') && !dest.includes('wa�ny')) {
      destinations.push({
        text: dest,
        position: match.index
      });
    }
  }

  console.log(`📍 Znaleziono ${destinations.length} kierunków:`);
  destinations.forEach(d => console.log(`   - ${d.text}`));
  console.log();

  // Dla każdego kierunku znajdź kursy
  for (let i = 0; i < destinations.length; i++) {
    const destination = destinations[i].text;
    const startPos = destinations[i].position;
    const endPos = i < destinations.length - 1 ? destinations[i + 1].position : html.length;

    // Wyciągnij sekcję HTML dla tego kierunku
    const section = html.substring(startPos, endPos);

    // Znajdź trasę "przez" (colspan bez bold, zawiera przecinki lub typowe nazwy)
    const viaRegex = /<td[^>]*colspan[^>]*>(?!<b>)([^<]+)<\/td>/gi;
    let via = null;
    let viaMatch;
    while ((viaMatch = viaRegex.exec(section)) !== null) {
      const text = viaMatch[1].trim();
      if (text.includes(',') || text.includes('przez')) {
        via = text.replace(/^przez:?\s*/i, '');
        break;
      }
    }

    // Znajdź wszystkie kursy - format: godzina w jednej kolumnie, symbol w następnej
    // Szukamy pary: <td>HH:MM</td> po czym <td>SYMBOL</td>
    const timeSymbolRegex = /<td[^>]*>(\d{1,2}:\d{2})<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi;
    let courseMatch;

    while ((courseMatch = timeSymbolRegex.exec(section)) !== null) {
      const time = courseMatch[1];
      const symbol = courseMatch[2].trim() || null;
      const daysFilter = symbolToDaysFilter(symbol);

      // Upewnij się że godzina ma format HH:MM
      const [hour, minute] = time.split(':');
      const normalizedTime = `${hour.padStart(2, '0')}:${minute}`;

      schedules.push({
        destination,
        time: normalizedTime,
        via,
        symbols: symbol,
        daysFilter
      });
    }
  }

  return schedules;
}

function generateSQL(schedules) {
  if (schedules.length === 0) {
    return `-- Brak danych do wygenerowania\n-- Sprawdź czy plik HTML zawiera tabelę z rozkładem\n`;
  }

  let sql = `-- Wygenerowano automatycznie: ${new Date().toLocaleString('pl-PL')}
-- Źródło: ${HTML_FILE}
-- Liczba kursów: ${schedules.length}

DELETE FROM bus_schedules WHERE route_type = 'PKS';

INSERT INTO bus_schedules (route_type, destination, departure_time, via, symbols, days_filter) VALUES\n`;

  const values = schedules.map((s, index) => {
    const via = s.via ? `'${escapeSQL(s.via)}'` : 'NULL';
    const symbols = s.symbols ? `'${escapeSQL(s.symbols)}'` : 'NULL';
    const comma = index < schedules.length - 1 ? ',' : ';';
    return `('PKS', '${escapeSQL(s.destination)}', '${s.time}', ${via}, ${symbols}, '${s.daysFilter}')${comma}`;
  });

  sql += values.join('\n');
  return sql;
}

function main() {
  console.log('🚌 Parser rozkładu jazdy PKS Grójec (prosty)\n');

  const schedules = parseScheduleTable();

  if (schedules.length === 0) {
    console.error('\n❌ Nie znaleziono żadnych kursów!');
    console.log('\n🔍 Możliwe przyczyny:');
    console.log('   - Plik HTML jest niepełny lub uszkodzony');
    console.log('   - Format tabeli jest inny niż oczekiwano');
    console.log('   - Strona używa JavaScript do ładowania danych\n');
    process.exit(1);
  }

  console.log(`\n✅ Znaleziono ${schedules.length} kursów\n`);

  // Statystyki
  const byDestination = {};
  schedules.forEach(s => {
    byDestination[s.destination] = (byDestination[s.destination] || 0) + 1;
  });

  console.log('📊 Kursy po kierunkach:');
  Object.entries(byDestination).forEach(([dest, count]) => {
    console.log(`   ${count.toString().padStart(3)} × ${dest}`);
  });

  console.log(`\n💾 Zapisywanie SQL...`);
  const sql = generateSQL(schedules);
  fs.writeFileSync(OUTPUT_FILE, sql, 'utf8');

  console.log(`✅ Zapisano: ${OUTPUT_FILE}\n`);

  console.log('📋 Następne kroki:');
  console.log('   1. Sprawdź plik SQL');
  console.log('   2. Wykonaj w Supabase SQL Editor');
  console.log('   3. Lub skopiuj do pliku migracji\n');

  // Przykłady
  console.log('🔍 Przykładowe kursy:');
  const uniqueDestinations = [...new Set(schedules.map(s => s.destination))].slice(0, 3);
  uniqueDestinations.forEach(dest => {
    const courses = schedules.filter(s => s.destination === dest).slice(0, 2);
    courses.forEach(c => {
      console.log(`   ${c.time} → ${c.destination.substring(0, 40)}... (${c.symbols || '∅'})`);
    });
  });
  console.log();
}

main();
