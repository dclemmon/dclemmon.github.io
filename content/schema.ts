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

export interface Season {
  id: string;
  title: string;
  /** Free text shown on the welcome page, e.g. "Placeholder content". */
  notice?: string;
  messages: Messages;
  weeks: Week[];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Earliest and latest dates any content may use. */
export const SEASON_BOUNDS = { start: '2026-11-29', end: '2026-12-25' } as const;

const KNOWN_SEASON = new Set(['id', 'title', 'notice', 'messages', 'weeks']);
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
