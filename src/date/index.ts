/**
 * @module date
 * Date/time utility functions for general-purpose use across industries.
 * No external dependencies — uses native Intl and Date APIs.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateInput = Date | string | number;

export type DurationUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

/** Normalizes any supported input into a native Date object. */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) return new Date(input);
  if (typeof input === 'number') return new Date(input);
  const parsed = new Date(input);
  if (isNaN(parsed.getTime())) throw new Error(`Invalid date input: "${input}"`);
  return parsed;
}

/** Returns true if the input is a valid date. */
export function isValidDate(input: DateInput): boolean {
  try {
    const d = toDate(input);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/** Format a date using Intl.DateTimeFormat. */
export function formatDate(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
  locale = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, options).format(toDate(input));
}

/** Returns "Jan 15, 2024" style string. */
export function formatShort(input: DateInput, locale = 'en-US'): string {
  return formatDate(input, { year: 'numeric', month: 'short', day: 'numeric' }, locale);
}

/** Returns "January 15, 2024" style string. */
export function formatLong(input: DateInput, locale = 'en-US'): string {
  return formatDate(input, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }, locale);
}

/** Returns ISO 8601 date string (YYYY-MM-DD). */
export function formatISO(input: DateInput): string {
  return toDate(input).toISOString().split('T')[0];
}

/** Returns time as HH:MM (24h or 12h). */
export function formatTime(input: DateInput, hour12 = true, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12 }).format(toDate(input));
}

/** Returns "2 hours ago", "in 3 days", etc. */
export function timeAgo(input: DateInput, locale = 'en-US'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = Date.now();
  const then = toDate(input).getTime();
  const diff = then - now;
  const absDiff = Math.abs(diff);

  const thresholds: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'year', ms: 31536000000 },
    { unit: 'month', ms: 2592000000 },
    { unit: 'week', ms: 604800000 },
    { unit: 'day', ms: 86400000 },
    { unit: 'hour', ms: 3600000 },
    { unit: 'minute', ms: 60000 },
    { unit: 'second', ms: 1000 },
  ];

  for (const { unit, ms } of thresholds) {
    if (absDiff >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return rtf.format(0, 'second');
}

// ─── Arithmetic ───────────────────────────────────────────────────────────────

/** Add a duration to a date. */
export function addDuration(input: DateInput, duration: Duration): Date {
  const d = toDate(input);
  const result = new Date(d);

  if (duration.years) result.setFullYear(result.getFullYear() + duration.years);
  if (duration.months) result.setMonth(result.getMonth() + duration.months);
  if (duration.weeks) result.setDate(result.getDate() + duration.weeks * 7);
  if (duration.days) result.setDate(result.getDate() + duration.days);
  if (duration.hours) result.setHours(result.getHours() + duration.hours);
  if (duration.minutes) result.setMinutes(result.getMinutes() + duration.minutes);
  if (duration.seconds) result.setSeconds(result.getSeconds() + duration.seconds);

  return result;
}

/** Subtract a duration from a date. */
export function subtractDuration(input: DateInput, duration: Duration): Date {
  const negated: Duration = {};
  (Object.keys(duration) as (keyof Duration)[]).forEach((key) => {
    negated[key] = -(duration[key] ?? 0);
  });
  return addDuration(input, negated);
}

/** Get the difference between two dates in a given unit. */
export function diffDates(a: DateInput, b: DateInput, unit: DurationUnit = 'days'): number {
  const msA = toDate(a).getTime();
  const msB = toDate(b).getTime();
  const diffMs = msA - msB;
  const divisors: Record<DurationUnit, number> = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 60000,
    hours: 3600000,
    days: 86400000,
    weeks: 604800000,
    months: 2592000000,
    years: 31536000000,
  };
  return diffMs / divisors[unit];
}

// ─── Boundaries ───────────────────────────────────────────────────────────────

/** Returns the start of a day (midnight). */
export function startOfDay(input: DateInput): Date {
  const d = toDate(input);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** Returns the end of a day (23:59:59.999). */
export function endOfDay(input: DateInput): Date {
  const d = toDate(input);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** Returns the first day of the month. */
export function startOfMonth(input: DateInput): Date {
  const d = toDate(input);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Returns the last day of the month. */
export function endOfMonth(input: DateInput): Date {
  const d = toDate(input);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Returns Monday of the week for the given date. */
export function startOfWeek(input: DateInput): Date {
  const d = toDate(input);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  return startOfDay(new Date(d.getTime() + diff * 86400000));
}

// ─── Comparison ───────────────────────────────────────────────────────────────

/** Returns true if two dates fall on the same calendar day. */
export function isSameDay(a: DateInput, b: DateInput): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Returns true if the date is today. */
export function isToday(input: DateInput): boolean {
  return isSameDay(input, new Date());
}

/** Returns true if the date is in the past. */
export function isPast(input: DateInput): boolean {
  return toDate(input).getTime() < Date.now();
}

/** Returns true if the date is in the future. */
export function isFuture(input: DateInput): boolean {
  return toDate(input).getTime() > Date.now();
}

/** Returns true if a date falls within a range (inclusive). */
export function isWithinRange(input: DateInput, range: DateRange): boolean {
  const t = toDate(input).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

// ─── Business Logic ───────────────────────────────────────────────────────────

/** Returns true if the date is a weekend (Sat or Sun). */
export function isWeekend(input: DateInput): boolean {
  const day = toDate(input).getDay();
  return day === 0 || day === 6;
}

/** Returns true if the date is a weekday. */
export function isWeekday(input: DateInput): boolean {
  return !isWeekend(input);
}

/** Returns the number of business days between two dates. */
export function businessDaysBetween(start: DateInput, end: DateInput): number {
  let count = 0;
  const current = new Date(toDate(start));
  const endDate = toDate(end);
  while (current <= endDate) {
    if (isWeekday(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Add N business days to a date. */
export function addBusinessDays(input: DateInput, days: number): Date {
  const result = toDate(input);
  let added = 0;
  const direction = days >= 0 ? 1 : -1;
  const target = Math.abs(days);
  while (added < target) {
    result.setDate(result.getDate() + direction);
    if (isWeekday(result)) added++;
  }
  return result;
}

/** Returns an array of dates between start and end (inclusive). */
export function dateRange(start: DateInput, end: DateInput): Date[] {
  const dates: Date[] = [];
  const current = startOfDay(start);
  const endDate = startOfDay(end);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/** Returns the quarter (1–4) of the given date. */
export function getQuarter(input: DateInput): number {
  return Math.floor(toDate(input).getMonth() / 3) + 1;
}

/** Returns the fiscal year start date given a fiscal month start (1=Jan, 4=Apr, 7=Jul, 10=Oct). */
export function getFiscalYearStart(input: DateInput, fiscalYearStartMonth = 1): Date {
  const d = toDate(input);
  const month = d.getMonth() + 1;
  const year = month >= fiscalYearStartMonth ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(year, fiscalYearStartMonth - 1, 1);
}
