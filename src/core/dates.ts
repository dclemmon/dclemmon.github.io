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
