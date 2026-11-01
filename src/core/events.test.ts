import { describe, expect, it } from 'vitest';
import seasonData from '../../content/advent-2026.json';
import { parseSeason, type ChurchEvent, type Season } from '../../content/schema.ts';
import { formatTime, formatTimeRange } from './dates.ts';
import {
  allOccurrences,
  eventDates,
  eventsBetween,
  eventsInWeek,
  getFeed,
  nextEvent,
  upcomingEvents,
} from './events.ts';
import { getWeekById } from './schedule.ts';

const season = parseSeason(seasonData);
const base: ChurchEvent = { id: 'x', feed: 'events', title: 'X', date: '2026-12-02' };

describe('eventDates', () => {
  it('a one-off event happens once', () => {
    expect(eventDates(base)).toEqual(['2026-12-02']);
  });

  it('weekly repeats through the end date, minus skipped dates', () => {
    const rehearsal = season.events!.find((e) => e.id === 'pageant-rehearsal')!;
    expect(eventDates(rehearsal)).toEqual(['2026-11-18', '2026-12-02', '2026-12-09', '2026-12-16']);
  });

  it('includes the end date when it lands on the weekday, and crosses months', () => {
    expect(eventDates({ ...base, date: '2026-11-25', repeatWeeklyUntil: '2026-12-09' })).toEqual([
      '2026-11-25',
      '2026-12-02',
      '2026-12-09',
    ]);
    expect(eventDates({ ...base, repeatWeeklyUntil: '2026-12-08' })).toEqual(['2026-12-02']);
  });
});

describe('choosing events to show', () => {
  it('orders by date, then all-day first, then start time', () => {
    const s: Season = {
      ...season,
      events: [
        { ...base, id: 'late', start: '18:00' },
        { ...base, id: 'early', start: '09:00' },
        { ...base, id: 'allday' },
        { ...base, id: 'before', date: '2026-12-01', start: '20:00' },
      ],
    };
    expect(allOccurrences(s).map((o) => o.event.id)).toEqual(['before', 'allday', 'early', 'late']);
  });

  it('gives each occurrence a stable key', () => {
    const keys = allOccurrences(season).map((o) => o.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('pageant-rehearsal@2026-12-09');
  });

  it('upcoming events start today and respect the limit', () => {
    expect(upcomingEvents(season, '2026-12-09', 3).map((o) => o.key)).toEqual([
      'pageant-rehearsal@2026-12-09',
      'cookie-decorating@2026-12-12',
      'pageant-rehearsal@2026-12-16',
    ]);
    expect(upcomingEvents(season, '2026-12-26')).toEqual([]);
  });

  it('keeps cancelled events so they can be labeled', () => {
    const cancelled = upcomingEvents(season, '2026-12-10').find(
      (o) => o.event.id === 'cookie-decorating',
    );
    expect(cancelled?.event.cancelled).toBe(true);
  });

  it('the next event skips cancelled dates', () => {
    expect(nextEvent(season, '2026-12-09')?.key).toBe('pageant-rehearsal@2026-12-09');
    expect(nextEvent(season, '2026-12-10')?.key).toBe('pageant-rehearsal@2026-12-16');
    expect(nextEvent(season, '2026-12-26')).toBeUndefined();
  });

  it('finds the events in a week', () => {
    const week2 = getWeekById(season, 'week-2')!;
    expect(eventsInWeek(season, week2).map((o) => o.key)).toEqual([
      'pageant-rehearsal@2026-12-09',
      'cookie-decorating@2026-12-12',
    ]);
    const christmas = getWeekById(season, 'christmas')!;
    expect(eventsInWeek(season, christmas).map((o) => o.event.id)).toEqual([
      'christmas-eve-family-service',
      'christmas-day-worship',
    ]);
  });

  it('events before Advent appear in a date range but in no week', () => {
    expect(eventsBetween(season, '2026-11-01', '2026-11-28').map((o) => o.key)).toEqual([
      'pageant-rehearsal@2026-11-18',
    ]);
    const inWeeks = season.weeks.flatMap((w) => eventsInWeek(season, w)).map((o) => o.key);
    expect(inWeeks).not.toContain('pageant-rehearsal@2026-11-18');
  });

  it('copes with no events at all', () => {
    const s = { ...season, events: undefined } as unknown as Season;
    expect(allOccurrences(s)).toEqual([]);
  });

  it('looks up a feed by id', () => {
    expect(getFeed(season, 'rehearsals')?.label).toBe('Rehearsal');
  });
});

describe('time formatting', () => {
  it.each([
    ['00:00', '12:00 am'],
    ['09:05', '9:05 am'],
    ['12:00', '12:00 pm'],
    ['18:30', '6:30 pm'],
    ['23:59', '11:59 pm'],
  ])('formatTime(%s) → %s', (t, out) => expect(formatTime(t)).toBe(out));

  it.each([
    ['18:00', '19:00', '6:00 – 7:00 pm'],
    ['09:00', '11:00', '9:00 – 11:00 am'],
    ['11:30', '12:30', '11:30 am – 12:30 pm'],
    ['16:00', undefined, '4:00 pm'],
    [undefined, undefined, 'All day'],
  ])('formatTimeRange(%s, %s) → %s', (s, e, out) => expect(formatTimeRange(s, e)).toBe(out));
});
