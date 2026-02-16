export const COURSE_LEGEND: Record<string, string> = {
  "&": "kursuje w dniu 1 stycznia",
  "~W": "połączenie składa się z 2 linii",
  "6": "kursuje w soboty",
  "7G": "kursuje w niedziele giełdowe",
  "a": "nie kursuje w pierwszy dzień Świąt Wielkanocnych oraz w dniu 25 XII",
  "b": "nie kursuje w dniu 1.I, w pierwszy dzień Świąt Wielkanocnych i w dniu 25 XII",
  "C": "kursuje w soboty, niedziele i święta",
  "D": "kursuje od poniedziałku do piątku oprócz świąt",
  "d": "nie kursuje w dniu 1.I, w pierwszy i drugi dzień Świąt Wielkanocnych oraz w dniach 25 i 26 XII",
  "e": "nie kursuje w okresie ferii letnich",
  "Ex": "kurs ekspresowy",
  "g": "nie kursuje w dniu 24.XII",
  "h": "nie kursuje w Wielką Sobotę oraz w dniu 24.XII",
  "l": "nie kursuje w dniu 31.XII",
  "M": "kurs. od pn. do pt. w okresie ferii letnich i zimowych oraz szkolnych przerw świątecznych oprócz św.",
  "m": "nie kursuje w dniach 24 i 31.XII",
  "p": "nie kursuje w pierwszy dzień Świąt Wielkanocnych oraz 25.XII",
  "S": "kursuje w dni nauki szkolnej",
  "U": "przewóz o charakterze użyteczności publicznej",
  "ź": "nie kursuje 03.05.2025r."
};

export function parseSymbols(symbolsString: string): string[] {
  if (!symbolsString) return [];

  const symbols: string[] = [];
  let i = 0;

  while (i < symbolsString.length) {
    if (i + 1 < symbolsString.length) {
      const twoChar = symbolsString.substring(i, i + 2);
      if (twoChar === '~W' || twoChar === 'Ex' || twoChar === '7G') {
        symbols.push(twoChar);
        i += 2;
        continue;
      }
    }

    symbols.push(symbolsString[i]);
    i++;
  }

  return symbols;
}

export function getSymbolDescription(symbol: string): string {
  return COURSE_LEGEND[symbol] || symbol;
}
