/**
 * Church events (services, special events, rehearsals): expanding weekly repeats
 * into dates and picking the ones to show. Framework-free; dates are YYYY-MM-DD.
 */
import type { ChurchEvent, Feed, FeedId, Season, Week } from '../../content/schema.ts';
import { addDays } from './dates.ts';

/** One date an event happens on. A repeating event has one per week. */
export interface EventOccurrence {
  event: ChurchEvent;
  date: string;
  /** Stable per occurrence, for keyed lists: "<event id>@<date>". */
  key: string;
}

/** Every date an event happens on: weekly through `repeatWeeklyUntil`, minus `skip`. */
export function eventDates(event: ChurchEvent): string[] {
  if (!event.repeatWeeklyUntil) return [event.date];
  const skip = new Set(event.skip ?? []);
  const dates: string[] = [];
  for (let d = event.date; d <= event.repeatWeeklyUntil; d = addDays(d, 7)) {
    if (!skip.has(d)) dates.push(d);
  }
  return dates;
}

/** All occurrences in date order; on the same day, all-day first, then by start time. */
export function allOccurrences(season: Season): EventOccurrence[] {
  return (season.events ?? [])
    .flatMap((event) =>
      eventDates(event).map((date) => ({ event, date, key: `${event.id}@${date}` })),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.event.start ?? '').localeCompare(b.event.start ?? '') ||
        a.event.title.localeCompare(b.event.title),
    );
}

/** Occurrences on or after `today`, earliest first. Cancelled ones are included (and labeled). */
export function upcomingEvents(season: Season, today: string, limit = Infinity): EventOccurrence[] {
  return allOccurrences(season)
    .filter((o) => o.date >= today)
    .slice(0, limit);
}

/** The next event that is still happening (cancelled dates are skipped), if any. */
export function nextEvent(season: Season, today: string): EventOccurrence | undefined {
  return upcomingEvents(season, today).find((o) => !o.event.cancelled);
}

/** Occurrences between two dates, inclusive. */
export function eventsBetween(season: Season, start: string, end: string): EventOccurrence[] {
  return allOccurrences(season).filter((o) => o.date >= start && o.date <= end);
}

/** Occurrences within a week's dates. */
export function eventsInWeek(season: Season, week: Week): EventOccurrence[] {
  return eventsBetween(season, week.startDate, week.endDate);
}

export function getFeed(season: Season, id: FeedId): Feed | undefined {
  return season.feeds.find((f) => f.id === id);
}
