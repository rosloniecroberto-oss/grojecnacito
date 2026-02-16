import fs from 'fs';
const html = fs.readFileSync('src/Tabliczka_ASG_HTML.html', 'latin1');

// Extract all symbol combinations from schedule cells
const symbolRegex = /<td[^>]*>([A-Za-z0-9&~]+)<\/td>/g;
const symbols = new Set();

let match;
while ((match = symbolRegex.exec(html)) !== null) {
  const symbol = match[1].trim();
  // Filter schedule symbols (short, contains letters/numbers)
  if (symbol.length > 0 && symbol.length < 20 && /[A-Za-z0-9]/.test(symbol) && !/^[0-9:]+$/.test(symbol)) {
    symbols.add(symbol);
  }
}

// Sort and display
const sorted = Array.from(symbols).sort();
console.log('Unique symbol combinations found:');
sorted.forEach(s => console.log(`  ${s}`));
console.log(`\nTotal: ${sorted.length} combinations`);
