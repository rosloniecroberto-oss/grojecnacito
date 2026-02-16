const POLISH_TIMEZONE = 'Europe/Warsaw';

export function getPolishDate(): Date {
  const now = new Date();
  const polishTimeString = now.toLocaleString('en-US', { timeZone: POLISH_TIMEZONE });
  return new Date(polishTimeString);
}

export function getPolishDayOfWeek(): number {
  return getPolishDate().getDay();
}

export function getPolishHours(): number {
  return getPolishDate().getHours();
}

export function getPolishMinutes(): number {
  return getPolishDate().getMinutes();
}

export function formatPolishTime(date: Date): string {
  return date.toLocaleString('pl-PL', {
    timeZone: POLISH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatPolishDate(date: Date): string {
  return date.toLocaleString('pl-PL', {
    timeZone: POLISH_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function getPolishDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: POLISH_TIMEZONE });
}

export function createPolishTime(hours: number, minutes: number): Date {
  const polishNow = getPolishDate();
  const dateInPoland = new Date(polishNow);
  dateInPoland.setHours(hours, minutes, 0, 0);
  return dateInPoland;
}

export function getMinutesUntilPolishTime(targetHours: number, targetMinutes: number): number {
  const now = getPolishDate();
  const target = createPolishTime(targetHours, targetMinutes);

  if (target < now) {
    target.setDate(target.getDate() + 1);
  }

  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60));
}

export function isPolishTimePast(hours: number, minutes: number): boolean {
  const now = getPolishDate();
  const target = createPolishTime(hours, minutes);
  return target < now;
}
