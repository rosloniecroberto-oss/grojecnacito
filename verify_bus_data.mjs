#!/usr/bin/env node

/**
 * Weryfikacja danych rozkładu w bazie Supabase
 *
 * Sprawdza:
 * - Liczbę kursów w bazie
 * - Unikalne kierunki
 * - Rozkład dni kursowania
 * - Symbole i ich znaczenie
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyBusData() {
  console.log('🔍 Weryfikacja danych rozkładu jazdy\n');

  // 1. Liczba wszystkich kursów
  const { data: allSchedules, error: allError } = await supabase
    .from('bus_schedules')
    .select('*');

  if (allError) {
    console.error('❌ Błąd pobierania danych:', allError.message);
    return;
  }

  console.log(`📊 Statystyki ogólne:`);
  console.log(`   Wszystkich kursów: ${allSchedules.length}`);

  // 2. Podział na PKS/MZK
  const pksCount = allSchedules.filter(s => s.route_type === 'PKS').length;
  const mzkCount = allSchedules.filter(s => s.route_type === 'MZK').length;
  console.log(`   PKS: ${pksCount}`);
  console.log(`   MZK: ${mzkCount}\n`);

  // 3. Unikalne kierunki
  const destinations = [...new Set(allSchedules.map(s => s.destination))].sort();
  console.log(`📍 Kierunki (${destinations.length}):`);
  destinations.forEach(dest => {
    const count = allSchedules.filter(s => s.destination === dest).length;
    console.log(`   ${count.toString().padStart(3)} × ${dest}`);
  });

  // 4. Dni kursowania
  console.log(`\n📅 Dni kursowania:`);
  const daysFilters = {};
  allSchedules.forEach(s => {
    daysFilters[s.days_filter] = (daysFilters[s.days_filter] || 0) + 1;
  });
  Object.entries(daysFilters)
    .sort((a, b) => b[1] - a[1])
    .forEach(([filter, count]) => {
      console.log(`   ${count.toString().padStart(3)} × ${filter}`);
    });

  // 5. Symbole
  console.log(`\n🔤 Symbole kursów:`);
  const symbolCounts = {};
  allSchedules.forEach(s => {
    const symbol = s.symbols || '(brak)';
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });
  Object.entries(symbolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([symbol, count]) => {
      console.log(`   ${count.toString().padStart(3)} × ${symbol}`);
    });

  // 6. Kursy bez VIA
  const withoutVia = allSchedules.filter(s => !s.via).length;
  console.log(`\n🚏 Kursy bez trasy "przez": ${withoutVia}`);

  // 7. Przykładowe kursy
  console.log(`\n📋 Przykładowe kursy (pierwsze 5):`);
  allSchedules.slice(0, 5).forEach(s => {
    const via = s.via ? ` (przez ${s.via.substring(0, 30)}...)` : '';
    console.log(`   ${s.departure_time} → ${s.destination}${via}`);
    console.log(`      Dni: ${s.days_filter}, Symbol: ${s.symbols || 'brak'}`);
  });

  // 8. Sprawdź duplikaty
  console.log(`\n🔎 Szukanie duplikatów...`);
  const keys = allSchedules.map(s =>
    `${s.route_type}|${s.destination}|${s.departure_time}|${s.days_filter}`
  );
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
  if (duplicates.length > 0) {
    console.log(`   ⚠️  Znaleziono ${duplicates.length} duplikatów!`);
    duplicates.slice(0, 3).forEach(dup => {
      const [type, dest, time, days] = dup.split('|');
      console.log(`      ${time} → ${dest} (${days})`);
    });
  } else {
    console.log(`   ✅ Brak duplikatów`);
  }

  console.log('\n');
}

verifyBusData().catch(console.error);
