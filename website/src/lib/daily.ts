// Turns the rows of Convex's views:daily into the points and axes of the charts on /views.

/** A day with views: that day's count, and the all-time total at the end of it. */
export type DayRow = { day: string; count: number; total: number };
/** A day on the charts. Both numbers are null for days before recording began. */
export type Point = { day: string; count: number | null; total: number | null };

/** How many days the charts span. views:daily returns as many rows. */
export const DAYS = 30;

const DAY_MS = 86_400_000;
const addDays = (day: string, n: number) => new Date(Date.parse(day) + n * DAY_MS).toISOString().slice(0, 10);

/** The day it is in Taipei (UTC+8 all year), as convex/views.ts counts days. */
export const taipeiDay = (now: number) => new Date(now + 8 * 3_600_000).toISOString().slice(0, 10);

/** "Nov 8". */
export const dayLabel = (day: string) =>
  new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/**
 * One point for each of the last 30 days, oldest first. Convex keeps no row for a day without
 * views, so those are filled in: no views, and the total of the day before.
 * @param rows oldest first
 */
export function toPoints(rows: DayRow[], today: string): Point[] {
  // A reader's clock can be behind; the newest counted day is always on the charts.
  const last = rows.at(-1)?.day ?? today;
  const end = last > today ? last : today;
  const start = addDays(end, 1 - DAYS);
  const byDay = new Map(rows.map((row) => [row.day, row]));
  // The total carries over from before the charts start, when it's known.
  let total = rows.findLast((row) => row.day < start)?.total ?? null;
  return Array.from({ length: DAYS }, (_, i) => {
    const day = addDays(start, i);
    const row = byDay.get(day);
    total = row?.total ?? total;
    return { day, count: row?.count ?? (total === null ? null : 0), total };
  });
}

/** Whole-number axis ticks, about four of them, from at or below `min` to at or above `max`. */
export function axisTicks(min: number, max: number) {
  const rough = Math.max(1, (max - min) / 3);
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((n) => n * power).find((n) => n >= rough)!;
  const first = Math.floor(min / step) * step;
  const count = Math.max(1, Math.ceil((max - first) / step));
  return Array.from({ length: count + 1 }, (_, i) => first + i * step);
}
