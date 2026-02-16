import { BusSchedule, CalendarSettings } from './types';
import { parseSymbols } from './courseLegend';
import {
  isPolishHoliday,
  isHolySaturday,
  isChristmasEve,
  isNewYearsEve,
  isSpecificDate,
  isSchoolDay,
  isSchoolBreak,
  HolidayInfo
} from './holidays';

export interface BusFilterResult {
  shouldShow: boolean;
  hiddenReason?: string;
}

export function shouldShowBus(
  bus: BusSchedule,
  date: Date,
  calendarSettings?: CalendarSettings
): BusFilterResult {
  if (bus.is_cancelled) {
    return { shouldShow: true };
  }

  const holidayInfo = isPolishHoliday(date);
  const dayOfWeek = date.getDay();
  const symbols = bus.symbols ? parseSymbols(bus.symbols) : [];

  const forceHoliday = calendarSettings?.force_holiday_mode || false;
  const forceBreak = calendarSettings?.force_break_mode || false;

  const isActualHoliday = holidayInfo.isHoliday || dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;
  const isWorkday = !isSaturday && !isSunday && !isActualHoliday;
  const treatAsHoliday = forceHoliday || isActualHoliday;

  const breakInfo = isSchoolBreak(date);
  const isActualBreak = breakInfo.isBreak;
  const treatAsBreak = forceBreak || isActualBreak;

  // KROK 1: Sprawdź czy kurs jest w odpowiedniej kolumnie rozkładu dla tego dnia
  const daysFilterArray = bus.days_filter.split(',');
  let isInCorrectColumn = false;

  if (isWorkday && daysFilterArray.includes('WORKDAYS')) {
    isInCorrectColumn = true;
  }
  if (isSaturday && daysFilterArray.includes('SATURDAYS')) {
    isInCorrectColumn = true;
  }
  if ((isSunday || isActualHoliday) && daysFilterArray.includes('SUNDAYS_HOLIDAYS')) {
    isInCorrectColumn = true;
  }

  if (!isInCorrectColumn) {
    return {
      shouldShow: false,
      hiddenReason: 'Kurs nie jest w odpowiedniej kolumnie rozkładu dla tego dnia'
    };
  }

  // KROK 2: Sprawdź symbole jako dodatkowe filtry wykluczające

  // Symbol D = tylko dni robocze (wyklucza weekendy i święta)
  if (symbols.includes('D')) {
    if (isSaturday || isSunday || isActualHoliday) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol D - kurs nie kursuje w weekendy i święta'
      };
    }
  }

  // Symbol S = tylko dni nauki szkolnej
  if (symbols.includes('S')) {
    if (forceBreak) {
      return {
        shouldShow: false,
        hiddenReason: 'Wymuszony tryb feryjny - kursy szkolne (S) nie kursują'
      };
    }
    if (forceHoliday) {
      return {
        shouldShow: false,
        hiddenReason: 'Wymuszony tryb świąteczny - kursy szkolne (S) nie kursują'
      };
    }
    const isActualSchoolDay = isSchoolDay(date);
    if (!isActualSchoolDay) {
      if (holidayInfo.isHoliday) {
        return {
          shouldShow: false,
          hiddenReason: `Święto: ${holidayInfo.name} - kursy szkolne (S) nie kursują`
        };
      }
      if (isSaturday || isSunday) {
        return {
          shouldShow: false,
          hiddenReason: 'Weekend - kursy szkolne (S) nie kursują'
        };
      }
      if (isActualBreak) {
        return {
          shouldShow: false,
          hiddenReason: `${breakInfo.periodName} - kursy szkolne (S) nie kursują`
        };
      }
    }
  }

  // Symbol C = tylko weekendy i święta
  if (symbols.includes('C') && !symbols.includes('D') && !symbols.includes('S')) {
    if (!isSaturday && !isSunday && !isActualHoliday && !forceHoliday) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol C - kurs kursuje tylko w weekendy i święta'
      };
    }
  }

  // Symbol M = tylko w okresie ferii
  if (symbols.includes('M')) {
    if (!treatAsBreak && !forceBreak) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol M - kurs kursuje tylko w okresie ferii i wakacji'
      };
    }
  }

  // Symbol 6 = tylko soboty
  if (symbols.includes('6') && !symbols.includes('D')) {
    if (!isSaturday) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol 6 - kurs kursuje tylko w soboty'
      };
    }
  }

  // Symbol 7 lub 7G = tylko niedziele
  if (symbols.includes('7') || bus.symbols?.includes('7G')) {
    if (!isSunday) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol 7/7G - kurs kursuje tylko w niedziele'
      };
    }
  }

  if (symbols.includes('&')) {
    if (isSpecificDate(date, 1, 1)) {
      return { shouldShow: true };
    } else {
      return {
        shouldShow: false,
        hiddenReason: 'Kurs & kursuje tylko 1 stycznia'
      };
    }
  }

  if (symbols.includes('g')) {
    if (isChristmasEve(date)) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol g - nie kursuje w Wigilię (24.XII)'
      };
    }
  }

  if (symbols.includes('l')) {
    if (isNewYearsEve(date)) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol l - nie kursuje w Sylwestra (31.XII)'
      };
    }
  }

  if (symbols.includes('m')) {
    if (isChristmasEve(date) || isNewYearsEve(date)) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol m - nie kursuje 24 i 31.XII'
      };
    }
  }

  if (symbols.includes('h')) {
    if (isHolySaturday(date) || isChristmasEve(date)) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol h - nie kursuje w Wielką Sobotę i Wigilię'
      };
    }
  }

  if (symbols.includes('a')) {
    const year = date.getFullYear();
    const easter = new Date(year, 0, 1);
    const easterActual = getEasterDate(year);
    if (
      (date.getMonth() === easterActual.getMonth() && date.getDate() === easterActual.getDate()) ||
      isSpecificDate(date, 12, 25)
    ) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol a - nie kursuje w pierwszy dzień Wielkanocy i 25.XII'
      };
    }
  }

  if (symbols.includes('b')) {
    const year = date.getFullYear();
    const easterActual = getEasterDate(year);
    if (
      isSpecificDate(date, 1, 1) ||
      (date.getMonth() === easterActual.getMonth() && date.getDate() === easterActual.getDate()) ||
      isSpecificDate(date, 12, 25)
    ) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol b - nie kursuje 1.I, pierwszy dzień Wielkanocy i 25.XII'
      };
    }
  }

  if (symbols.includes('d')) {
    const year = date.getFullYear();
    const easterActual = getEasterDate(year);
    const easterMonday = new Date(easterActual);
    easterMonday.setDate(easterActual.getDate() + 1);

    if (
      isSpecificDate(date, 1, 1) ||
      (date.getMonth() === easterActual.getMonth() && date.getDate() === easterActual.getDate()) ||
      (date.getMonth() === easterMonday.getMonth() && date.getDate() === easterMonday.getDate()) ||
      isSpecificDate(date, 12, 25) ||
      isSpecificDate(date, 12, 26)
    ) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol d - nie kursuje 1.I, pierwszy i drugi dzień Wielkanocy, 25 i 26.XII'
      };
    }
  }

  if (symbols.includes('p')) {
    const year = date.getFullYear();
    const easterActual = getEasterDate(year);
    if (
      (date.getMonth() === easterActual.getMonth() && date.getDate() === easterActual.getDate()) ||
      isSpecificDate(date, 12, 25)
    ) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol p - nie kursuje w pierwszy dzień Wielkanocy i 25.XII'
      };
    }
  }

  if (symbols.includes('ź')) {
    if (isSpecificDate(date, 5, 3) && date.getFullYear() === 2025) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol ź - nie kursuje 3.05.2025'
      };
    }
  }

  if (symbols.includes('e')) {
    const month = date.getMonth() + 1;
    if (month >= 6 && month <= 8) {
      return {
        shouldShow: false,
        hiddenReason: 'Symbol e - nie kursuje w okresie ferii letnich'
      };
    }
  }

  return { shouldShow: true };
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

export function getNoCoursesMessage(date: Date, calendarSettings?: CalendarSettings): string | null {
  const holidayInfo = isPolishHoliday(date);

  if (calendarSettings?.force_holiday_mode) {
    return 'Wymuszony tryb świąteczny. Większość kursów nie jest realizowana.';
  }

  if (calendarSettings?.force_break_mode) {
    return 'Wymuszony tryb feryjny. Kursy szkolne nie są realizowane.';
  }

  if (holidayInfo.isHoliday) {
    return `Dzisiaj jest ${holidayInfo.name}. Część kursów nie jest realizowana.`;
  }

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 6) {
    return 'Dzisiaj jest sobota. Część kursów nie jest realizowana.';
  }

  const breakInfo = isSchoolBreak(date);
  if (breakInfo.isBreak) {
    return `${breakInfo.periodName}. Kursy szkolne nie są realizowane.`;
  }

  return null;
}
