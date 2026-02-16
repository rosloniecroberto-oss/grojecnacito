import re

with open('src/Tabliczka_ASG_HTML.html', 'r', encoding='latin1') as f:
    html = f.read()

# Find all symbols in schedule cells (after time, before </td>)
pattern = r'<td[^>]*>(\d{2}:\d{2})</td>\s*<td[^>]*>([A-Za-z0-9&~]+)</td>'
matches = re.findall(pattern, html)

symbols = set()
for time, symbol in matches:
    if symbol and len(symbol) < 15:
        symbols.add(symbol)

print(f"Found {len(symbols)} unique symbol combinations:")
for s in sorted(symbols):
    print(f"  {s}")
