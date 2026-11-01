/**
 * Pure iCalendar (RFC 5545) generator for the season. No I/O, so it's unit tested.
 */
import {
  FEED_FILES,
  FEED_IDS,
  type ChurchEvent,
  type FeedId,
  type Season,
  type Week,
} from '../content/schema.ts';
import { vtimezone, zonedToUtc } from './timezone.ts';

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

const localStamp = (date: string, time: string) =>
  `${compactDate(date)}T${time.replace(':', '')}00`;

function churchEventLines(
  event: ChurchEvent,
  tz: string,
  opts: IcsOptions,
  stamp: string,
): string[] {
  const timed = event.start !== undefined;
  const lines = ['BEGIN:VEVENT', `UID:${event.id}@${UID_DOMAIN}`, `DTSTAMP:${stamp}`];

  if (timed) {
    lines.push(`DTSTART;TZID=${tz}:${localStamp(event.date, event.start!)}`);
    if (event.end) lines.push(`DTEND;TZID=${tz}:${localStamp(event.date, event.end)}`);
  } else {
    lines.push(
      `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
      `DTEND;VALUE=DATE:${compactDate(dayAfter(event.date))}`,
    );
  }

  if (event.repeatWeeklyUntil) {
    // UNTIL must be UTC when DTSTART has a time zone: the end of that local day.
    const until = timed
      ? utcStamp(zonedToUtc(event.repeatWeeklyUntil, '23:59:59', tz))
      : compactDate(event.repeatWeeklyUntil);
    lines.push(`RRULE:FREQ=WEEKLY;UNTIL=${until}`);
    for (const d of event.skip ?? []) {
      lines.push(
        timed
          ? `EXDATE;TZID=${tz}:${localStamp(d, event.start!)}`
          : `EXDATE;VALUE=DATE:${compactDate(d)}`,
      );
    }
  }

  const summary = event.cancelled ? `Cancelled: ${event.title}` : event.title;
  const description = [event.description, `More in the app: ${opts.appUrl}`]
    .filter(Boolean)
    .join('\n\n');
  lines.push(`SUMMARY:${escapeText(summary)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  lines.push(`DESCRIPTION:${escapeText(description)}`, `URL:${opts.appUrl}`);
  if (event.cancelled) lines.push('STATUS:CANCELLED');
  if (!timed) lines.push('TRANSP:TRANSPARENT');
  lines.push('END:VEVENT');
  return lines;
}

/** Years an event touches (with the year before, so the time zone block starts early enough). */
function eventYears(events: ChurchEvent[]): number[] {
  const years = events.flatMap((e) =>
    [e.date, e.repeatWeeklyUntil ?? e.date].map((d) => +d.slice(0, 4)),
  );
  return years.length ? [Math.min(...years) - 1, ...years] : [];
}

/** One calendar feed as iCalendar text. */
export function buildFeed(season: Season, feedId: FeedId, opts: IcsOptions): string {
  const stamp = utcStamp(opts.now);
  const feed = season.feeds.find((f) => f.id === feedId);
  const name = feed ? `${season.title}: ${feed.title}` : season.title;
  const weeks = feedId === 'reminders' || feedId === 'all' ? season.weeks : [];
  const events = (season.events ?? []).filter((e) => feedId === 'all' || e.feed === feedId);
  const timed = events.filter((e) => e.start !== undefined);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${UID_DOMAIN}//${season.id}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-CALDESC:${escapeText(feed?.description ?? name)}`,
    ...(timed.length ? [`X-WR-TIMEZONE:${season.timeZone}`] : []),
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...(timed.length ? vtimezone(season.timeZone, eventYears(timed)) : []),
    ...weeks.flatMap((w) => eventFor(w, opts, stamp)),
    ...events.flatMap((e) => churchEventLines(e, season.timeZone, opts, stamp)),
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** The weekly reminders feed (advent.ics). */
export function buildIcs(season: Season, opts: IcsOptions): string {
  return buildFeed(season, 'reminders', opts);
}

/** Every feed, keyed by its published file name. */
export function buildAllFeeds(season: Season, opts: IcsOptions): Record<string, string> {
  return Object.fromEntries(
    FEED_IDS.map((id) => [FEED_FILES[id], buildFeed(season, id, opts)] as const),
  );
}
