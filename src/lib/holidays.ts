export interface HolidayInfo {
  name: string;
  isHoliday: boolean;
}

function getEasterDate(year: number): Date {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  return new Date(year, month - 1, day);
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isPolishHoliday(date: Date): HolidayInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const easter = getEasterDate(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  const holidays: Array<{ date: Date; name: string }> = [
    { date: new Date(year, 0, 1), name: 'Nowy Rok' },
    { date: new Date(year, 0, 6), name: 'Trzech Króli' },
    { date: easter, name: 'Wielkanoc' },
    { date: easterMonday, name: 'Poniedziałek Wielkanocny' },
    { date: new Date(year, 4, 1), name: 'Święto Pracy' },
    { date: new Date(year, 4, 3), name: 'Święto Konstytucji 3 Maja' },
    { date: corpusChristi, name: 'Boże Ciało' },
    { date: new Date(year, 7, 15), name: 'Wniebowzięcie NMP' },
    { date: new Date(year, 10, 1), name: 'Wszystkich Świętych' },
    { date: new Date(year, 10, 11), name: 'Narodowe Święto Niepodległości' },
    { date: new Date(year, 11, 25), name: 'Boże Narodzenie' },
    { date: new Date(year, 11, 26), name: 'Drugi Dzień Bożego Narodzenia' },
  ];

  for (const holiday of holidays) {
    if (isSameDay(date, holiday.date)) {
      return { name: holiday.name, isHoliday: true };
    }
  }

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) {
    return { name: 'Niedziela', isHoliday: true };
  }

  return { name: '', isHoliday: false };
}

export function isHolySaturday(date: Date): boolean {
  const year = date.getFullYear();
  const easter = getEasterDate(year);
  const holySaturday = new Date(easter);
  holySaturday.setDate(easter.getDate() - 1);

  return isSameDay(date, holySaturday);
}

export function isChristmasEve(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() === 24;
}

export function isNewYearsEve(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() === 31;
}

export function isSpecificDate(date: Date, month: number, day: number): boolean {
  return date.getMonth() + 1 === month && date.getDate() === day;
}

export interface SchoolBreakPeriod {
  start: Date;
  end: Date;
  name: string;
}

export function getSchoolBreaks(year: number): SchoolBreakPeriod[] {
  return [
    {
      start: new Date(year, 0, 20),
      end: new Date(year, 1, 2),
      name: 'Ferie zimowe (woj. mazowieckie)'
    },
    {
      start: new Date(year, 5, 21),
      end: new Date(year, 7, 31),
      name: 'Wakacje letnie'
    }
  ];
}

export function isSchoolBreak(date: Date): { isBreak: boolean; periodName: string } {
  const year = date.getFullYear();
  const breaks = getSchoolBreaks(year);

  for (const breakPeriod of breaks) {
    if (date >= breakPeriod.start && date <= breakPeriod.end) {
      return { isBreak: true, periodName: breakPeriod.name };
    }
  }

  return { isBreak: false, periodName: '' };
}

export function isSchoolDay(date: Date): boolean {
  const holidayInfo = isPolishHoliday(date);
  if (holidayInfo.isHoliday) return false;

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const breakInfo = isSchoolBreak(date);
  if (breakInfo.isBreak) return false;

  return true;
}
