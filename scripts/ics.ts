/**
 * Pure iCalendar (RFC 5545) generator for the season. No I/O, so it's unit tested.
 */
import type { Season, Week } from '../content/schema.ts';

export interface IcsOptions {
  /** Absolute URL of the app root, ending in "/", e.g. "https://example.org/". */
  appUrl: string;
  /** Used for DTSTAMP. */
  now: Date;
}

const UID_DOMAIN = 'advent-follow-along';

/** Escape TEXT values: backslash, semicolon, comma, newline. */
export function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Fold a content line to at most 75 octets per line (UTF-8 aware). */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74; // continuation lines start with a space
    }
    current += ch;
    bytes += n;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const compactDate = (iso: string) => iso.replace(/-/g, '');

function dayAfter(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return dt.toISOString().slice(0, 10);
}

function utcStamp(dt: Date): string {
  return dt
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function eventFor(week: Week, opts: IcsOptions, stamp: string): string[] {
  const url = `${opts.appUrl}#${week.id}`;
  const summary =
    week.kind === 'christmas' ? `Advent: ${week.title}` : `Advent ${week.label}: ${week.title}`;
  const description = `${week.intro}\n\nThis week's activities: ${url}`;
  // Christmas spans its whole range (Eve + Day); Advent weeks are a single Sunday reminder.
  const end = week.kind === 'christmas' ? dayAfter(week.endDate) : dayAfter(week.startDate);
  return [
    'BEGIN:VEVENT',
    `UID:${week.id}@${UID_DOMAIN}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(week.startDate)}`,
    `DTEND;VALUE=DATE:${compactDate(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(summary)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
  ];
}

export function buildIcs(season: Season, opts: IcsOptions): string {
  const stamp = utcStamp(opts.now);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${UID_DOMAIN}//${season.id}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(season.title)}`,
    `X-WR-CALDESC:${escapeText(`Weekly reminders for ${season.title}`)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
    ...season.weeks.flatMap((w) => eventFor(w, opts, stamp)),
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
