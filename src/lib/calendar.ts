import { DayType } from './types';
import { getPolishDate, getPolishDateString } from './polishTime';

export interface PolishHoliday {
  date: string;
  name: string;
  isFixed: boolean;
}

function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

export function getPolishHolidays2026(): PolishHoliday[] {
  const easter = calculateEaster(2026);

  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  const holidays: PolishHoliday[] = [
    { date: '2026-01-01', name: 'Nowy Rok', isFixed: true },
    { date: '2026-01-06', name: 'Trzech Króli', isFixed: true },
    { date: easter.toISOString().split('T')[0], name: 'Wielkanoc', isFixed: false },
    { date: easterMonday.toISOString().split('T')[0], name: 'Poniedziałek Wielkanocny', isFixed: false },
    { date: '2026-05-01', name: 'Święto Pracy', isFixed: true },
    { date: '2026-05-03', name: 'Święto Konstytucji 3 Maja', isFixed: true },
    { date: corpusChristi.toISOString().split('T')[0], name: 'Boże Ciało', isFixed: false },
    { date: '2026-08-15', name: 'Wniebowzięcie NMP', isFixed: true },
    { date: '2026-11-01', name: 'Wszystkich Świętych', isFixed: true },
    { date: '2026-11-11', name: 'Święto Niepodległości', isFixed: true },
    { date: '2026-12-25', name: 'Boże Narodzenie', isFixed: true },
    { date: '2026-12-26', name: 'Drugi Dzień Bożego Narodzenia', isFixed: true },
  ];

  return holidays;
}

export function getDayType(date?: Date): DayType {
  const polishDate = date || getPolishDate();
  const dateString = getPolishDateString(polishDate);
  const holidays = getPolishHolidays2026();

  const isHoliday = holidays.some(h => h.date === dateString);
  if (isHoliday) return 'holiday';

  const polishDayOfWeek = polishDate.getDay();

  // Map JS day (0=Sunday, 6=Saturday) to our DayType
  const dayMap: { [key: number]: DayType } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };

  return dayMap[polishDayOfWeek] || 'monday';
}

export function getHolidayByDate(date: Date): PolishHoliday | undefined {
  const dateString = getPolishDateString(date);
  return getPolishHolidays2026().find(h => h.date === dateString);
}

export function isToday(date: Date): boolean {
  const today = getPolishDate();
  return getPolishDateString(date) === getPolishDateString(today);
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = getPolishDate();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getPolishDateString(date) === getPolishDateString(tomorrow);
}

export function getDaysUntil(date: Date): number {
  const today = getPolishDate();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(date?: Date): string {
  const polishDate = date || getPolishDate();

  return polishDate.toLocaleDateString('pl-PL', {
    timeZone: 'Europe/Warsaw',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
