/**
 * Content types and validation for the Advent season file.
 *
 * All user-facing text lives in the JSON content file. Progress is keyed by the
 * stable `id` on each activity, never by title or array position.
 */

export interface Link {
  href: string;
  label: string;
}

export interface Image {
  src: string;
  alt: string;
}

export interface Activity {
  /** Stable ID (lowercase slug). Check-offs are stored under this key. */
  id: string;
  title: string;
  description: string;
  /** Optional YYYY-MM-DD within the section's range. Omit for a whole-week item. */
  date?: string;
  scripture?: string;
  link?: Link;
  image?: Image;
  /** Longer optional text, shown in the details dialog. */
  details?: string;
}

export type SectionKind = 'advent' | 'christmas';

/** The five wreath candles: four Advent candles (3 is the rose one) and the Christ candle. */
export const CANDLE_SLOTS = ['1', '2', '3', '4', 'christ'] as const;
export type CandleSlot = (typeof CANDLE_SLOTS)[number];

/** Short labels longer than this may not fit five week chips on a 360px phone. */
export const SHORT_TITLE_MAX = 7;

export interface Week {
  id: string;
  kind: SectionKind;
  /** Short label, e.g. "Week 1". */
  label: string;
  title: string;
  /** Short label for week chips, e.g. "Jesus". Defaults to `title`. */
  shortTitle?: string;
  theme?: string;
  intro: string;
  /** Which wreath candle this section lights (on its start date). */
  candle?: CandleSlot;
  /** Shown after "All N done." when every activity is checked. */
  doneMessage?: string;
  /** Inclusive local dates, YYYY-MM-DD. */
  startDate: string;
  endDate: string;
  activities: Activity[];
}

export interface Messages {
  beforeTitle: string;
  beforeBody: string;
  afterTitle: string;
  afterBody: string;
}

/** The calendar feeds the build publishes. IDs are fixed (they name the .ics files). */
export const FEED_IDS = ['reminders', 'events', 'rehearsals', 'all'] as const;
export type FeedId = (typeof FEED_IDS)[number];

/** Feeds an event can belong to (the others are built from weeks, or combine everything). */
export const EVENT_FEEDS = ['events', 'rehearsals'] as const;
export type EventFeedId = (typeof EVENT_FEEDS)[number];

/** Display text for a calendar feed. Editable; only `id` is fixed. */
export interface Feed {
  id: FeedId;
  /** Name in the app and in people's calendars, e.g. "Rehearsals". */
  title: string;
  /** One line under the name in the calendar dialog. */
  description: string;
  /** Short type label shown on each event in the app, e.g. "Rehearsal". Event feeds only. */
  label?: string;
}

/** A service, special event or rehearsal. Times are local to `Season.timeZone`. */
export interface ChurchEvent {
  /** Stable ID (lowercase slug). Calendar apps match updates by it, so never change it. */
  id: string;
  feed: EventFeedId;
  title: string;
  /** YYYY-MM-DD; for a repeating event, the first date. */
  date: string;
  /** HH:MM, 24-hour. Omit both times for an all-day event. */
  start?: string;
  end?: string;
  location?: string;
  description?: string;
  /** Repeat on the same weekday each week through this YYYY-MM-DD date. */
  repeatWeeklyUntil?: string;
  /** Dates (YYYY-MM-DD) a weekly event doesn't happen. */
  skip?: string[];
  /** Keep cancelled events (instead of deleting) so subscribed calendars update. */
  cancelled?: boolean;
}

export interface Season {
  id: string;
  title: string;
  /** Free text shown on the welcome page, e.g. "Placeholder content". */
  notice?: string;
  /** IANA time zone for event times, e.g. "America/Denver". */
  timeZone: string;
  messages: Messages;
  feeds: Feed[];
  weeks: Week[];
  /** Optional; a season can have no church events. */
  events?: ChurchEvent[];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Earliest and latest dates any content may use. */
export const SEASON_BOUNDS = { start: '2026-11-29', end: '2026-12-25' } as const;

const KNOWN_SEASON = new Set([
  'id',
  'title',
  'notice',
  'timeZone',
  'messages',
  'feeds',
  'weeks',
  'events',
]);
const KNOWN_FEED = new Set(['id', 'title', 'description', 'label']);
const KNOWN_EVENT = new Set([
  'id',
  'feed',
  'title',
  'date',
  'start',
  'end',
  'location',
  'description',
  'repeatWeeklyUntil',
  'skip',
  'cancelled',
]);
const KNOWN_WEEK = new Set([
  'id',
  'kind',
  'label',
  'title',
  'shortTitle',
  'theme',
  'intro',
  'candle',
  'doneMessage',
  'startDate',
  'endDate',
  'activities',
]);
const KNOWN_ACTIVITY = new Set([
  'id',
  'title',
  'description',
  'date',
  'scripture',
  'link',
  'image',
  'details',
]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** True if `s` is a real calendar date in YYYY-MM-DD form. */
export function isValidIsoDate(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function nextIsoDate(s: string): string {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

/** True if `tz` is an IANA time zone this JavaScript engine knows. */
export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function weekday(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function isSafeHref(href: string): boolean {
  if (href.startsWith('https://')) return true;
  // Relative links within the app (no scheme, no protocol-relative).
  return !/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('//');
}

function warnUnknown(
  obj: Record<string, unknown>,
  known: Set<string>,
  where: string,
  warnings: string[],
): void {
  for (const key of Object.keys(obj)) {
    if (!known.has(key)) warnings.push(`${where}: unknown field "${key}" (ignored)`);
  }
}

/** Validate untrusted content data. Never throws. */
export function validateSeason(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Map<string, string>();
  const seenCandles = new Map<string, string>();

  const checkId = (id: unknown, where: string) => {
    if (!isNonEmptyString(id)) {
      errors.push(`${where}: missing "id"`);
      return;
    }
    if (!ID_RE.test(id)) {
      errors.push(`${where}: id "${id}" must be lowercase letters, numbers and dashes`);
    }
    const prev = seenIds.get(id);
    if (prev) errors.push(`${where}: duplicate id "${id}" (also used by ${prev})`);
    else seenIds.set(id, where);
  };

  const requireStrings = (obj: Record<string, unknown>, fields: string[], where: string) => {
    for (const f of fields) {
      if (!isNonEmptyString(obj[f])) errors.push(`${where}: missing or empty "${f}"`);
    }
  };

  const optionalString = (obj: Record<string, unknown>, field: string, where: string) => {
    if (obj[field] !== undefined && !isNonEmptyString(obj[field])) {
      errors.push(`${where}: "${field}" must be non-empty text if present`);
    }
  };

  if (!isObject(data)) {
    return { errors: ['Content must be a JSON object'], warnings };
  }

  warnUnknown(data, KNOWN_SEASON, 'season', warnings);
  checkId(data.id, 'season');
  requireStrings(data, ['title'], 'season');
  optionalString(data, 'notice', 'season');

  if (!isObject(data.messages)) {
    errors.push('season: missing "messages"');
  } else {
    requireStrings(
      data.messages,
      ['beforeTitle', 'beforeBody', 'afterTitle', 'afterBody'],
      'season.messages',
    );
  }

  if (!isValidTimeZone(data.timeZone)) {
    errors.push('season: "timeZone" must be a time zone name like "America/Denver"');
  }

  validateFeeds(data.feeds, errors, warnings);

  if (!Array.isArray(data.weeks) || data.weeks.length === 0) {
    errors.push('season: "weeks" must be a non-empty list');
    return { errors, warnings };
  }

  let prevEnd: string | undefined;

  data.weeks.forEach((week: unknown, wi: number) => {
    const wWhere = `weeks[${wi}]`;
    if (!isObject(week)) {
      errors.push(`${wWhere}: must be an object`);
      return;
    }
    const wName = isNonEmptyString(week.id) ? `week "${week.id}"` : wWhere;
    warnUnknown(week, KNOWN_WEEK, wName, warnings);
    checkId(week.id, wName);
    requireStrings(week, ['label', 'title', 'intro'], wName);
    optionalString(week, 'theme', wName);
    optionalString(week, 'shortTitle', wName);
    optionalString(week, 'doneMessage', wName);

    if (isNonEmptyString(week.shortTitle) && week.shortTitle.trim().length > SHORT_TITLE_MAX) {
      warnings.push(
        `${wName}: "shortTitle" is longer than ${SHORT_TITLE_MAX} letters and may not fit on a phone`,
      );
    }

    if (week.candle !== undefined) {
      if (!(CANDLE_SLOTS as readonly unknown[]).includes(week.candle)) {
        errors.push(
          `${wName}: "candle" must be one of ${CANDLE_SLOTS.map((c) => `"${c}"`).join(', ')}`,
        );
      } else {
        const prev = seenCandles.get(week.candle as string);
        if (prev) errors.push(`${wName}: candle "${week.candle}" is already used by ${prev}`);
        else seenCandles.set(week.candle as string, wName);
      }
    }
    if (week.kind === 'christmas' && week.candle !== 'christ') {
      warnings.push(`${wName}: a "christmas" section usually lights the "christ" candle`);
    }

    if (week.kind !== 'advent' && week.kind !== 'christmas') {
      errors.push(`${wName}: "kind" must be "advent" or "christmas"`);
    }

    const { startDate, endDate } = week;
    const datesOk = isValidIsoDate(startDate) && isValidIsoDate(endDate);
    if (!isValidIsoDate(startDate)) errors.push(`${wName}: "startDate" must be YYYY-MM-DD`);
    if (!isValidIsoDate(endDate)) errors.push(`${wName}: "endDate" must be YYYY-MM-DD`);

    if (datesOk) {
      if (endDate < startDate) errors.push(`${wName}: endDate is before startDate`);
      if (startDate < SEASON_BOUNDS.start || endDate > SEASON_BOUNDS.end) {
        errors.push(
          `${wName}: dates must fall between ${SEASON_BOUNDS.start} and ${SEASON_BOUNDS.end}`,
        );
      }
      if (prevEnd !== undefined) {
        if (startDate <= prevEnd) {
          errors.push(`${wName}: overlaps or is out of order with the previous section`);
        } else if (startDate !== nextIsoDate(prevEnd)) {
          errors.push(`${wName}: leaves a gap after the previous section (ends ${prevEnd})`);
        }
      }
      prevEnd = endDate;
    }

    if (!Array.isArray(week.activities) || week.activities.length === 0) {
      errors.push(`${wName}: needs at least one activity`);
      return;
    }

    week.activities.forEach((act: unknown, ai: number) => {
      const aWhere = `${wName} activities[${ai}]`;
      if (!isObject(act)) {
        errors.push(`${aWhere}: must be an object`);
        return;
      }
      const aName = isNonEmptyString(act.id)
        ? `${wName}, activity #${ai + 1} ("${act.id}")`
        : `${wName}, activity #${ai + 1}`;
      warnUnknown(act, KNOWN_ACTIVITY, aName, warnings);
      checkId(act.id, aName);
      requireStrings(act, ['title', 'description'], aName);
      optionalString(act, 'scripture', aName);
      optionalString(act, 'details', aName);

      if (act.date !== undefined) {
        if (!isValidIsoDate(act.date)) {
          errors.push(`${aName}: "date" must be YYYY-MM-DD`);
        } else if (datesOk && (act.date < startDate || act.date > endDate)) {
          errors.push(`${aName}: date ${act.date} is outside ${wName} (${startDate}–${endDate})`);
        }
      }

      if (act.link !== undefined) {
        if (!isObject(act.link) || !isNonEmptyString(act.link.href)) {
          errors.push(`${aName}: "link" needs "href" and "label"`);
        } else {
          if (!isNonEmptyString(act.link.label)) errors.push(`${aName}: link needs a "label"`);
          if (!isSafeHref(act.link.href)) {
            errors.push(`${aName}: link must be https:// or a relative path`);
          }
        }
      }

      if (act.image !== undefined) {
        if (!isObject(act.image) || !isNonEmptyString(act.image.src)) {
          errors.push(`${aName}: "image" needs "src" and "alt"`);
        } else if (typeof act.image.alt !== 'string') {
          errors.push(
            `${aName}: image needs "alt" text (use "" only for purely decorative images)`,
          );
        }
      }
    });
  });

  validateEvents(data.events, checkId, errors, warnings);

  return { errors, warnings };
}

/** Validate and narrow. Throws with all errors listed if invalid. */
export function parseSeason(data: unknown): Season {
  const { errors } = validateSeason(data);
  if (errors.length > 0) {
    throw new Error(`Invalid content:\n- ${errors.join('\n- ')}`);
  }
  return data as Season;
}

function validateFeeds(feeds: unknown, errors: string[], warnings: string[]): void {
  if (!Array.isArray(feeds)) {
    errors.push('season: "feeds" must be a list');
    return;
  }
  const seen = new Set<string>();
  feeds.forEach((feed: unknown, i: number) => {
    const where = `feeds[${i}]`;
    if (!isObject(feed)) {
      errors.push(`${where}: must be an object`);
      return;
    }
    const name = isNonEmptyString(feed.id) ? `feed "${feed.id}"` : where;
    warnUnknown(feed, KNOWN_FEED, name, warnings);
    if (!(FEED_IDS as readonly unknown[]).includes(feed.id)) {
      errors.push(`${where}: "id" must be one of ${FEED_IDS.map((f) => `"${f}"`).join(', ')}`);
    } else if (seen.has(feed.id as string)) {
      errors.push(`${name}: listed twice`);
    } else {
      seen.add(feed.id as string);
    }
    for (const f of ['title', 'description']) {
      if (!isNonEmptyString(feed[f])) errors.push(`${name}: missing or empty "${f}"`);
    }
    if (feed.label !== undefined && !isNonEmptyString(feed.label)) {
      errors.push(`${name}: "label" must be non-empty text if present`);
    }
    if ((EVENT_FEEDS as readonly unknown[]).includes(feed.id) && feed.label === undefined) {
      errors.push(`${name}: needs a "label" (shown on each event, e.g. "Rehearsal")`);
    }
  });
  for (const id of FEED_IDS) {
    if (!seen.has(id)) errors.push(`season: "feeds" is missing the "${id}" feed`);
  }
}

function validateEvents(
  events: unknown,
  checkId: (id: unknown, where: string) => void,
  errors: string[],
  warnings: string[],
): void {
  if (events === undefined) return;
  if (!Array.isArray(events)) {
    errors.push('season: "events" must be a list');
    return;
  }
  events.forEach((ev: unknown, i: number) => {
    const where = `events[${i}]`;
    if (!isObject(ev)) {
      errors.push(`${where}: must be an object`);
      return;
    }
    const name = isNonEmptyString(ev.id) ? `event "${ev.id}"` : where;
    warnUnknown(ev, KNOWN_EVENT, name, warnings);
    checkId(ev.id, name);
    if (!isNonEmptyString(ev.title)) errors.push(`${name}: missing or empty "title"`);
    if (!(EVENT_FEEDS as readonly unknown[]).includes(ev.feed)) {
      errors.push(`${name}: "feed" must be ${EVENT_FEEDS.map((f) => `"${f}"`).join(' or ')}`);
    }
    for (const f of ['location', 'description']) {
      if (ev[f] !== undefined && !isNonEmptyString(ev[f])) {
        errors.push(`${name}: "${f}" must be non-empty text if present`);
      }
    }
    if (ev.cancelled !== undefined && typeof ev.cancelled !== 'boolean') {
      errors.push(`${name}: "cancelled" must be true or false`);
    }

    const dateOk = isValidIsoDate(ev.date);
    if (!dateOk) errors.push(`${name}: "date" must be YYYY-MM-DD`);

    for (const f of ['start', 'end']) {
      if (ev[f] !== undefined && (typeof ev[f] !== 'string' || !TIME_RE.test(ev[f]))) {
        errors.push(`${name}: "${f}" must be a 24-hour time like "18:30"`);
      }
    }
    if (ev.end !== undefined && ev.start === undefined) {
      errors.push(`${name}: has an "end" time but no "start" time`);
    }
    if (
      typeof ev.start === 'string' &&
      typeof ev.end === 'string' &&
      TIME_RE.test(ev.start) &&
      TIME_RE.test(ev.end) &&
      ev.end <= ev.start
    ) {
      errors.push(`${name}: "end" (${ev.end}) must be after "start" (${ev.start})`);
    }

    const until = ev.repeatWeeklyUntil;
    if (until !== undefined) {
      if (!isValidIsoDate(until)) {
        errors.push(`${name}: "repeatWeeklyUntil" must be YYYY-MM-DD`);
      } else if (dateOk && until < (ev.date as string)) {
        errors.push(`${name}: "repeatWeeklyUntil" (${until}) is before "date" (${ev.date})`);
      }
    }

    if (ev.skip !== undefined) {
      if (until === undefined) errors.push(`${name}: "skip" only applies to repeating events`);
      if (!Array.isArray(ev.skip)) {
        errors.push(`${name}: "skip" must be a list of dates`);
      } else {
        for (const d of ev.skip) {
          if (!isValidIsoDate(d)) {
            errors.push(`${name}: skip date "${String(d)}" must be YYYY-MM-DD`);
          } else if (dateOk && isValidIsoDate(until)) {
            if (d < (ev.date as string) || d > until || weekday(d) !== weekday(ev.date as string)) {
              warnings.push(`${name}: skip date ${d} isn't one of this event's weekly dates`);
            }
          }
        }
      }
    }
  });
}
