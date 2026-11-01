/**
 * Time zone helpers for the calendar feeds, built on Intl (no tz database dependency).
 * Event times are written as local wall-clock times in the season's time zone.
 */

/** Offset of `tz` from UTC at the given instant, in minutes (Denver in winter: -420). */
export function offsetMinutes(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
  return Math.round((asUtc - utcMs) / 60000);
}

/** The UTC instant of a local wall-clock time ("2026-12-16", "23:59:59") in `tz`. */
export function zonedToUtc(date: string, time: string, tz: string): Date {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi, s = 0] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi, s);
  // Two passes settle the offset, including near daylight-saving changes.
  let utc = wall - offsetMinutes(wall, tz) * 60000;
  utc = wall - offsetMinutes(utc, tz) * 60000;
  return new Date(utc);
}

export interface Transition {
  /** Local wall-clock time just before the change, as YYYYMMDDTHHMMSS. */
  localStart: string;
  fromMinutes: number;
  toMinutes: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

function localStamp(utcMs: number, offset: number): string {
  const d = new Date(utcMs + offset * 60000);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`
  );
}

/** Offset changes (daylight saving starts and ends) in a calendar year, found via Intl. */
export function transitionsInYear(year: number, tz: string): Transition[] {
  const out: Transition[] = [];
  const HOUR = 3600000;
  const end = Date.UTC(year + 1, 0, 1);
  let t = Date.UTC(year, 0, 1);
  let prev = offsetMinutes(t, tz);
  for (t += HOUR; t <= end; t += HOUR) {
    const cur = offsetMinutes(t, tz);
    if (cur !== prev) {
      // Narrow to the minute within this hour.
      let lo = t - HOUR;
      let hi = t;
      while (hi - lo > 60000) {
        const mid = lo + Math.floor((hi - lo) / 120000) * 60000;
        if (offsetMinutes(mid, tz) === prev) lo = mid;
        else hi = mid;
      }
      out.push({ localStart: localStamp(hi, prev), fromMinutes: prev, toMinutes: cur });
      prev = cur;
    }
  }
  return out;
}

/** "-0700" style offset for iCalendar. */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`;
}

/**
 * A VTIMEZONE block covering the given years, from the offsets Intl reports. Each
 * daylight-saving change is listed explicitly (no yearly rules), which calendar
 * apps accept and which stays correct if the rules ever change.
 */
export function vtimezone(tz: string, years: number[]): string[] {
  const lines = ['BEGIN:VTIMEZONE', `TZID:${tz}`];
  const sorted = [...new Set(years)].sort();
  const changes = sorted.flatMap((y) => transitionsInYear(y, tz));
  if (changes.length === 0) {
    const off = formatOffset(offsetMinutes(Date.UTC(sorted[0], 0, 1), tz));
    lines.push(
      'BEGIN:STANDARD',
      `DTSTART:${sorted[0]}0101T000000`,
      `TZOFFSETFROM:${off}`,
      `TZOFFSETTO:${off}`,
      'END:STANDARD',
    );
  }
  for (const c of changes) {
    const kind = c.toMinutes > c.fromMinutes ? 'DAYLIGHT' : 'STANDARD';
    lines.push(
      `BEGIN:${kind}`,
      `DTSTART:${c.localStart}`,
      `TZOFFSETFROM:${formatOffset(c.fromMinutes)}`,
      `TZOFFSETTO:${formatOffset(c.toMinutes)}`,
      `END:${kind}`,
    );
  }
  lines.push('END:VTIMEZONE');
  return lines;
}
