/**
 * Date helpers that work in the device's local time zone.
 * Dates are YYYY-MM-DD strings, which sort and compare correctly as text.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD as a local date (midnight). Returns null if invalid. */
export function parseIsoDate(s: string): Date | null {
  const m = DATE_RE.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

/** Format a Date as local YYYY-MM-DD. */
export function toIsoDate(dt: Date): string {
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

/** Add whole days to a YYYY-MM-DD string. */
export function addDays(iso: string, days: number): string {
  const dt = parseIsoDate(iso);
  if (!dt) throw new Error(`Invalid date: ${iso}`);
  dt.setDate(dt.getDate() + days);
  return toIsoDate(dt);
}

/** e.g. "Sunday, November 29". */
export function formatLongDate(iso: string, locale = 'en-US'): string {
  const dt = parseIsoDate(iso);
  if (!dt) return iso;
  return dt.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** e.g. "Thu, Dec 24". */
export function formatShortDate(iso: string, locale = 'en-US'): string {
  const dt = parseIsoDate(iso);
  if (!dt) return iso;
  return dt.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** e.g. "Nov 29 – Dec 5". */
export function formatRange(startIso: string, endIso: string, locale = 'en-US'): string {
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  if (!s || !e) return `${startIso} – ${endIso}`;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString(locale, opts)} – ${e.toLocaleDateString(locale, opts)}`;
}

/** e.g. "Dec 13". */
export function formatMonthDay(iso: string, locale = 'en-US'): string {
  const dt = parseIsoDate(iso);
  if (!dt) return iso;
  return dt.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** Like formatRange, but drops a repeated month: "Dec 6 – 12", "Nov 29 – Dec 5". */
export function formatRangeCompact(startIso: string, endIso: string, locale = 'en-US'): string {
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  if (!s || !e) return `${startIso} – ${endIso}`;
  const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
  const end = sameMonth
    ? e.toLocaleDateString(locale, { day: 'numeric' })
    : formatMonthDay(endIso, locale);
  return `${formatMonthDay(startIso, locale)} – ${end}`;
}

function parseTime(hhmm: string): { h: number; m: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  return match ? { h: Number(match[1]), m: Number(match[2]) } : null;
}

const clock = ({ h, m }: { h: number; m: number }) =>
  `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`;
const meridiem = (h: number) => (h < 12 ? 'am' : 'pm');

/** "18:00" → "6:00 pm". */
export function formatTime(hhmm: string): string {
  const t = parseTime(hhmm);
  return t ? `${clock(t)} ${meridiem(t.h)}` : hhmm;
}

/**
 * Event times for display: "6:00 – 7:00 pm", "11:30 am – 12:30 pm", "6:00 pm",
 * or "All day" when there's no start time.
 */
export function formatTimeRange(start?: string, end?: string): string {
  const s = start ? parseTime(start) : null;
  if (!s) return 'All day';
  const e = end ? parseTime(end) : null;
  if (!e) return formatTime(start!);
  return meridiem(s.h) === meridiem(e.h)
    ? `${clock(s)} – ${clock(e)} ${meridiem(e.h)}`
    : `${formatTime(start!)} – ${formatTime(end!)}`;
}
