export const WEEKDAYS = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const MEAL_TYPES = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) => d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}
