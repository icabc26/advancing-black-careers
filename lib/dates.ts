/**
 * Pure, time-zone-safe calendar helpers for the tracker date picker.
 *
 * Dates are plain `{ y, m, d }` values (m is 1-based). Nothing here passes a
 * `YYYY-MM-DD` string to `new Date()` or reads local-time getters on a stored
 * date, so output never shifts by a day in negative-offset time zones.
 * All weekday and day arithmetic goes through UTC. `todayLocal()` is the one
 * intentional local-time call, because "today" means the Member's local date.
 *
 * Names are hard-coded en-GB arrays rather than `Intl`, so output doesn't
 * depend on ICU data or the runtime locale.
 */

export type CalDate = { y: number; m: number; d: number }; // m: 1–12
export type YearMonth = { y: number; m: number };

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// Indexed by weekdayMon0: 0 = Monday … 6 = Sunday.
const WEEKDAYS_LONG = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Builds a UTC Date for a calendar day. Uses `setUTCFullYear` because
 * `Date.UTC` maps years 0–99 to 1900–1999. Day overflow/underflow rolls over
 * the month as usual (e.g. d = 0 is the last day of the previous month).
 */
function utcDate(y: number, m: number, d: number): Date {
  const date = new Date(Date.UTC(2000, 0, 1));
  date.setUTCFullYear(y, m - 1, d);
  return date;
}

/** Number of days in month `m` (1–12) of year `y`. */
export function daysInMonth(y: number, m: number): number {
  return utcDate(y, m + 1, 0).getUTCDate();
}

/** Weekday with Monday = 0 … Sunday = 6. */
export function weekdayMon0(date: CalDate): number {
  return (utcDate(date.y, date.m, date.d).getUTCDay() + 6) % 7;
}

/**
 * Parses a strict `YYYY-MM-DD` string. Returns `null` for any other shape
 * (including surrounding whitespace) or an impossible month/day.
 */
export function parseIso(s: string): CalDate | null {
  const match = ISO_RE.exec(s);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Zero-padded `YYYY-MM-DD`. */
export function formatIso(date: CalDate): string {
  return `${pad(date.y, 4)}-${pad(date.m, 2)}-${pad(date.d, 2)}`;
}

/** en-GB display format, e.g. "2 Sep 2025". */
export function formatDisplay(date: CalDate): string {
  return `${date.d} ${MONTHS_SHORT[date.m - 1]} ${date.y}`;
}

/** Full accessible name, e.g. "Tuesday 2 September 2025". */
export function formatAccessibleName(date: CalDate): string {
  return `${WEEKDAYS_LONG[weekdayMon0(date)]} ${date.d} ${MONTHS_LONG[date.m - 1]} ${date.y}`;
}

/** Month heading, e.g. "September 2025". */
export function formatMonthHeading(ym: YearMonth): string {
  return `${MONTHS_LONG[ym.m - 1]} ${ym.y}`;
}

/** Today's date in the Member's local time zone (local time on purpose). */
export function todayLocal(now: Date = new Date()): CalDate {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

/** True when both are set and refer to the same calendar day. */
export function sameDay(a: CalDate | null, b: CalDate | null): boolean {
  return a !== null && b !== null && a.y === b.y && a.m === b.m && a.d === b.d;
}

/** Moves `n` calendar days (negative goes back), rolling month and year. */
export function addDays(date: CalDate, n: number): CalDate {
  const t = utcDate(date.y, date.m, date.d + n);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Moves `n` months (negative goes back), rolling the year. */
export function addMonths(ym: YearMonth, n: number): YearMonth {
  const total = ym.y * 12 + (ym.m - 1) + n;
  const y = Math.floor(total / 12);
  return { y, m: total - y * 12 + 1 };
}

/**
 * Monday-first month grid: rows of 7, `null` before day 1 and after the last
 * day. Always 4–6 rows.
 */
export function monthGrid(ym: YearMonth): (CalDate | null)[][] {
  const lead = weekdayMon0({ y: ym.y, m: ym.m, d: 1 });
  const cells: (CalDate | null)[] = Array.from({ length: lead }, () => null);
  const days = daysInMonth(ym.y, ym.m);
  for (let d = 1; d <= days; d++) cells.push({ y: ym.y, m: ym.m, d });
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (CalDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/**
 * Year select options: `currentYear − 10` to `currentYear + 5`, plus the
 * selected and displayed years, sorted ascending with no duplicates.
 */
export function yearOptions(
  currentYear: number,
  selectedYear: number | null,
  displayedYear: number,
): number[] {
  const years = new Set<number>();
  for (let y = currentYear - 10; y <= currentYear + 5; y++) years.add(y);
  if (selectedYear !== null) years.add(selectedYear);
  years.add(displayedYear);
  return [...years].sort((a, b) => a - b);
}
