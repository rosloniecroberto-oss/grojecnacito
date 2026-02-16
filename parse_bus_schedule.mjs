#!/usr/bin/env node

/**
 * Parser rozkładu jazdy autobusów PKS z HTML do SQL
 *
 * Użycie:
 * 1. Pobierz plik HTML z https://www.pksgrojec.pl/rozklad_new/tpo_XXXXXX.html
 * 2. Zapisz jako src/Tabliczka_ASG_HTML.html
 * 3. Uruchom: node parse_bus_schedule.mjs
 */

import fs from 'fs';
import { JSDOM } from 'jsdom';

const HTML_FILE = 'src/Tabliczka_ASG_HTML.html';
const OUTPUT_FILE = 'generated_bus_schedules.sql';

// Mapa symboli dni na days_filter
const symbolToDaysFilter = {
  // Dni robocze
  'D': 'WORKDAYS',
  'DU': 'WORKDAYS',
  'SU': 'WORKDAYS',
  'MU': 'WORKDAYS',
  'DeU': 'WORKDAYS',
  'dU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',

  // Soboty i niedziele
  'C': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'CdU': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'CMU': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'MCdU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',

  // Tylko niedziele
  '7GU': 'SUNDAYS_HOLIDAYS',

  // Wszystkie dni
  'U': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',

  // Soboty
  '6dU': 'SATURDAYS',
  'D6dU': 'WORKDAYS,SATURDAYS',
  'D6h': 'WORKDAYS,SATURDAYS',
  'D6d': 'WORKDAYS,SATURDAYS',
  'D6b': 'WORKDAYS,SATURDAYS',
  'D6dź': 'WORKDAYS,SATURDAYS',

  // Inne kombinacje
  'd': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'dmU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'S': 'WORKDAYS',
  'M': 'WORKDAYS',
  'De': 'WORKDAYS',
  'DEx': 'WORKDAYS',
  'SCbU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'bU': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'CbU': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'bSC': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'CD': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'Ca': 'SATURDAYS,SUNDAYS_HOLIDAYS',
  'g&a': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'SCpl': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'Dm': 'WORKDAYS',
  'pmh': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'DU~W': 'WORKDAYS',
  'SU~W': 'WORKDAYS',
  'ph': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
  'bl&': 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS',
};

function parseHTML() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`❌ Nie znaleziono pliku: ${HTML_FILE}`);
    console.log('\n📋 Instrukcja:');
    console.log('1. Otwórz: https://www.pksgrojec.pl/rozklad_new/');
    console.log('2. Znajdź rozkład dla Grójca');
    console.log('3. Zapisz stronę jako: src/Tabliczka_ASG_HTML.html');
    process.exit(1);
  }

  const html = fs.readFileSync(HTML_FILE, 'latin1');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const schedules = [];
  let currentDestination = null;
  let currentVia = null;

  // Znajdź wszystkie wiersze tabeli
  const rows = document.querySelectorAll('table.tp tr');

  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) continue;

    // Sprawdź czy to wiersz z kierunkiem (ma colspan i bold)
    const firstCell = cells[0];
    if (firstCell.hasAttribute('colspan') && firstCell.querySelector('b')) {
      const text = firstCell.textContent.trim();
      // Wyciąg kierunku (np. "BIAŁOBRZEGI P.D. UL. POŚWIĘTNA")
      if (text && !text.includes('PKS') && !text.includes('Rozkład')) {
        currentDestination = text;
        currentVia = null;
        continue;
      }
    }

    // Sprawdź czy to wiersz z trasą "przez" (ma colspan ale nie bold)
    if (cells.length > 0 && firstCell.hasAttribute('colspan') && !firstCell.querySelector('b')) {
      const text = firstCell.textContent.trim();
      if (text.includes('przez') || text.includes(',')) {
        currentVia = text.replace(/^przez:?\s*/i, '').trim();
        continue;
      }
    }

    // Sprawdź czy to wiersz z godzinami
    // Format: | godzina | minuta | symbol | godzina | minuta | symbol | ...
    if (cells.length >= 3) {
      for (let i = 0; i + 2 < cells.length; i += 3) {
        const hourCell = cells[i];
        const minuteCell = cells[i + 1];
        const symbolCell = cells[i + 2];

        const hour = hourCell?.textContent.trim();
        const minute = minuteCell?.textContent.trim();
        const symbol = symbolCell?.textContent.trim();

        // Walidacja godziny i minuty
        if (hour && minute && /^\d{1,2}$/.test(hour) && /^\d{2}$/.test(minute)) {
          const time = `${hour.padStart(2, '0')}:${minute}`;

          // Określ days_filter na podstawie symbolu
          let daysFilter = 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS';
          if (symbol && symbolToDaysFilter[symbol]) {
            daysFilter = symbolToDaysFilter[symbol];
          }

          if (currentDestination) {
            schedules.push({
              destination: currentDestination,
              time: time,
              via: currentVia || null,
              symbols: symbol || null,
              daysFilter: daysFilter
            });
          }
        }
      }
    }
  }

  return schedules;
}

function generateSQL(schedules) {
  let sql = `-- Wygenerowano automatycznie przez parse_bus_schedule.mjs
-- Data: ${new Date().toISOString()}
-- Liczba kursów: ${schedules.length}

DELETE FROM bus_schedules WHERE route_type = 'PKS';

INSERT INTO bus_schedules (route_type, destination, departure_time, via, symbols, days_filter) VALUES\n`;

  const values = schedules.map((schedule, index) => {
    const via = schedule.via ? `'${schedule.via.replace(/'/g, "''")}'` : 'NULL';
    const symbols = schedule.symbols ? `'${schedule.symbols.replace(/'/g, "''")}'` : 'NULL';
    const comma = index < schedules.length - 1 ? ',' : ';';

    return `('PKS', '${schedule.destination.replace(/'/g, "''")}', '${schedule.time}', ${via}, ${symbols}, '${schedule.daysFilter}')${comma}`;
  });

  sql += values.join('\n');

  return sql;
}

function main() {
  console.log('🚌 Parser rozkładu jazdy PKS Grójec\n');

  console.log('📖 Czytanie pliku HTML...');
  const schedules = parseHTML();

  console.log(`✅ Znaleziono ${schedules.length} kursów\n`);

  // Statystyki
  const destinations = new Set(schedules.map(s => s.destination));
  console.log(`📍 Kierunki: ${destinations.size}`);
  destinations.forEach(dest => {
    const count = schedules.filter(s => s.destination === dest).length;
    console.log(`   - ${dest}: ${count} kursów`);
  });

  console.log(`\n💾 Generowanie SQL...`);
  const sql = generateSQL(schedules);

  fs.writeFileSync(OUTPUT_FILE, sql, 'utf8');
  console.log(`✅ Zapisano: ${OUTPUT_FILE}\n`);

  console.log('📋 Następne kroki:');
  console.log('1. Sprawdź wygenerowany plik SQL');
  console.log('2. Wykonaj migrację w Supabase lub użyj execute_sql');
  console.log(`3. Możesz też skopiować do pliku migracji\n`);

  // Pokaż przykładowe rekordy
  console.log('🔍 Przykładowe rekordy:');
  schedules.slice(0, 3).forEach(s => {
    console.log(`   ${s.time} → ${s.destination} (${s.symbols || 'brak symbolu'})`);
  });
}

main();
