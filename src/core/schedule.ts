/**
 * Which part of the season is "now", based on the device's local date.
 * Framework-free; no Svelte imports.
 */
import type { Activity, Season, Week } from '../../content/schema.ts';
import { parseIsoDate, toIsoDate } from './dates.ts';

export type Phase = 'before' | 'during' | 'after';

export interface SeasonState {
  phase: Phase;
  /** The section to show by default: Week 1 before the season, the last one after. */
  currentWeekId: string;
  today: string;
}

/**
 * Today's date as YYYY-MM-DD. A valid `?date=YYYY-MM-DD` in `search`
 * overrides the clock (for demos and QA); invalid values are ignored.
 */
export function getToday(search: string, now: Date = new Date()): string {
  return getDateOverride(search) ?? toIsoDate(now);
}

/** The `?date=YYYY-MM-DD` preview date, if present and valid. */
export function getDateOverride(search: string): string | undefined {
  const override = new URLSearchParams(search).get('date');
  return override && parseIsoDate(override) ? override : undefined;
}

export function getSeasonState(season: Season, today: string): SeasonState {
  const weeks = season.weeks;
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  if (today < first.startDate) return { phase: 'before', currentWeekId: first.id, today };
  if (today > last.endDate) return { phase: 'after', currentWeekId: last.id, today };
  const week = weeks.find((w) => today >= w.startDate && today <= w.endDate) ?? first;
  return { phase: 'during', currentWeekId: week.id, today };
}

export function getWeekById(season: Season, id: string | null | undefined): Week | undefined {
  if (!id) return undefined;
  return season.weeks.find((w) => w.id === id);
}

export function prevWeek(season: Season, id: string): Week | undefined {
  const i = season.weeks.findIndex((w) => w.id === id);
  return i > 0 ? season.weeks[i - 1] : undefined;
}

export function nextWeek(season: Season, id: string): Week | undefined {
  const i = season.weeks.findIndex((w) => w.id === id);
  return i >= 0 && i < season.weeks.length - 1 ? season.weeks[i + 1] : undefined;
}

/** Week ID from a location hash like "#week-2", if it names a real section. */
export function weekIdFromHash(season: Season, hash: string): string | undefined {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  return getWeekById(season, id)?.id;
}

/** Activities explicitly dated for `isoDate` (daily prompts). */
export function getActivitiesForDate(season: Season, isoDate: string): Activity[] {
  return season.weeks.flatMap((w) => w.activities.filter((a) => a.date === isoDate));
}

/** Activities in display order: whole-week items first, then dated items by date. */
export function sortActivities(activities: Activity[]): Activity[] {
  return activities
    .map((a, i) => ({ a, i }))
    .sort((x, y) => {
      const dx = x.a.date ?? '';
      const dy = y.a.date ?? '';
      if (dx !== dy) return dx < dy ? -1 : 1;
      return x.i - y.i;
    })
    .map(({ a }) => a);
}
