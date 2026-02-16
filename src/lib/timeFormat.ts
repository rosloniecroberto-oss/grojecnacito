export function formatTimeUntil(minutes: number): string {
  if (minutes < 1) return 'Za chwilę';
  if (minutes === 1) return 'Za 1 min';
  if (minutes < 60) return `Za ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? 'Za ok. 1h' : `Za ok. ${hours}h`;
  }

  if (remainingMinutes < 15) {
    return hours === 1 ? 'Za ok. 1h' : `Za ok. ${hours}h`;
  }

  return `Za ${hours}h ${remainingMinutes}min`;
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}
