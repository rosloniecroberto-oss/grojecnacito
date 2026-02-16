import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envFile = readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

// Parse symbol string into days_filter and symbols
// Based on HTML legend:
// - Capital letters (D, S, C, M, 6, 7G) = day types
// - Lowercase letters (a, b, d, e, g, h, l, m, p) = modifiers
// - Special symbols: U (użyteczność), Ex (ekspres), ~W (multi-line)
function parseSymbols(symbolStr) {
  if (!symbolStr) return { days: null, symbols: null };

  let remaining = symbolStr;
  const daysArr = [];
  const symbolsArr = [];

  // Extract all capital letter day codes and numbers
  const dayPattern = /^([DSCM]|[67][A-Z]?)/;
  let match;
  while ((match = remaining.match(dayPattern))) {
    daysArr.push(match[1]);
    remaining = remaining.substring(match[1].length);
  }

  // Extract lowercase modifiers
  const modifierPattern = /^[a-z&~]+/;
  match = remaining.match(modifierPattern);
  if (match) {
    daysArr.push(match[0]); // modifiers are part of days_filter
    remaining = remaining.substring(match[0].length);
  }

  // Remaining are special symbols (U, Ex, W, etc.)
  if (remaining) {
    symbolsArr.push(remaining);
  }

  return {
    days: daysArr.length > 0 ? daysArr.join('') : null,
    symbols: symbolsArr.length > 0 ? symbolsArr.join('') : null
  };
}

// Test parsing
console.log('Testing symbol parsing:');
const testCases = ['SU', 'DU', 'DeU', 'MCdU', 'DEx', 'SCbU', 'D6d', 'S', 'D', 'U'];
testCases.forEach(test => {
  const result = parseSymbols(test);
  console.log(`  ${test.padEnd(10)} => days: ${(result.days || 'null').padEnd(5)} symbols: ${result.symbols || 'null'}`);
});

// Get all bus schedules with days_filter 'S' and check if symbols need updating
const { data: schedules, error } = await supabase
  .from('bus_schedules')
  .select('*')
  .eq('days_filter', 'S');

if (error) {
  console.error('Error fetching schedules:', error);
  process.exit(1);
}

console.log(`\nFound ${schedules.length} schedules with days_filter='S'`);
console.log('\nThese should likely have symbols that include "U" or other indicators.');
console.log('Current state of S-day schedules:');

const grouped = {};
schedules.forEach(s => {
  const key = `${s.departure_time} -> ${s.destination}`;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(s);
});

Object.entries(grouped).slice(0, 20).forEach(([key, items]) => {
  items.forEach(item => {
    console.log(`  ${item.departure_time} -> ${item.destination.padEnd(30)} | days: ${item.days_filter} | symbols: ${item.symbols || 'null'}`);
  });
});

console.log('\n\nNOTE: Based on HTML, these schedules should have their symbols field checked.');
console.log('For example, "SU" in HTML should be: days_filter="S", symbols="U"');
console.log('\nTo fix: Need to re-import from HTML with proper symbol parsing.');
