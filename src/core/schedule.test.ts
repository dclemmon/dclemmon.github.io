import { describe, expect, it } from 'vitest';
import seasonData from '../../content/advent-2026.json';
import { parseSeason } from '../../content/schema.ts';
import {
  getActivitiesForDate,
  getSeasonState,
  getToday,
  litCandles,
  nextWeek,
  prevWeek,
  sortActivities,
  weekIdFromHash,
  weekTiming,
} from './schedule.ts';

const season = parseSeason(seasonData);

describe('getSeasonState', () => {
  it.each([
    ['2026-11-28', 'before', 'week-1'],
    ['2026-11-29', 'during', 'week-1'],
    ['2026-12-05', 'during', 'week-1'],
    ['2026-12-06', 'during', 'week-2'],
    ['2026-12-10', 'during', 'week-2'],
    ['2026-12-19', 'during', 'week-3'],
    ['2026-12-20', 'during', 'week-4'],
    ['2026-12-23', 'during', 'week-4'],
    ['2026-12-24', 'during', 'christmas'],
    ['2026-12-25', 'during', 'christmas'],
    ['2026-12-26', 'after', 'christmas'],
    ['2026-01-15', 'before', 'week-1'],
  ])('%s → %s / %s', (date, phase, weekId) => {
    expect(getSeasonState(season, date)).toEqual({ phase, currentWeekId: weekId, today: date });
  });
});

describe('getToday', () => {
  // Local-time constructor so the test is time-zone independent.
  const now = new Date(2026, 10, 30, 23, 59);

  it('uses the local date with no override', () => {
    expect(getToday('', now)).toBe('2026-11-30');
  });

  it('uses a valid ?date= override', () => {
    expect(getToday('?date=2026-12-10', now)).toBe('2026-12-10');
    expect(getSeasonState(season, getToday('?date=2026-12-10', now)).currentWeekId).toBe('week-2');
  });

  it.each(['?date=2026-13-01', '?date=2026-02-30', '?date=tomorrow', '?date='])(
    'ignores invalid override %s',
    (search) => {
      expect(getToday(search, now)).toBe('2026-11-30');
    },
  );
});

describe('navigation helpers', () => {
  it('prev/next stop at the ends', () => {
    expect(prevWeek(season, 'week-1')).toBeUndefined();
    expect(nextWeek(season, 'week-1')?.id).toBe('week-2');
    expect(prevWeek(season, 'christmas')?.id).toBe('week-4');
    expect(nextWeek(season, 'christmas')).toBeUndefined();
  });

  it('reads a week from the hash', () => {
    expect(weekIdFromHash(season, '#week-3')).toBe('week-3');
    expect(weekIdFromHash(season, '#nope')).toBeUndefined();
    expect(weekIdFromHash(season, '')).toBeUndefined();
  });
});

describe('dated (daily) activities', () => {
  it('getActivitiesForDate returns only that day', () => {
    expect(getActivitiesForDate(season, '2026-12-24').map((a) => a.id)).toEqual(['xmas-eve-story']);
    expect(getActivitiesForDate(season, '2026-12-25').map((a) => a.id)).toEqual([
      'xmas-christ-candle',
      'xmas-birthday',
    ]);
    expect(getActivitiesForDate(season, '2026-12-10')).toEqual([]);
  });

  it('sortActivities puts whole-week items first, then by date, stable', () => {
    const acts = [
      { id: 'c', title: 'c', description: 'c', date: '2026-12-03' },
      { id: 'a', title: 'a', description: 'a' },
      { id: 'b', title: 'b', description: 'b', date: '2026-12-01' },
      { id: 'd', title: 'd', description: 'd' },
    ];
    expect(sortActivities(acts).map((a) => a.id)).toEqual(['a', 'd', 'b', 'c']);
  });
});

describe('litCandles', () => {
  it.each([
    ['2026-11-28', []],
    ['2026-11-29', ['1']],
    ['2026-12-05', ['1']],
    ['2026-12-06', ['1', '2']],
    ['2026-12-13', ['1', '2', '3']],
    ['2026-12-20', ['1', '2', '3', '4']],
    ['2026-12-23', ['1', '2', '3', '4']],
    ['2026-12-24', ['1', '2', '3', '4', 'christ']],
    ['2026-12-25', ['1', '2', '3', '4', 'christ']],
    ['2026-12-26', ['1', '2', '3', '4', 'christ']],
  ])('%s → %j', (date, slots) => {
    expect([...litCandles(season, date)].sort()).toEqual([...slots].sort());
  });

  it('follows a ?date= override', () => {
    const now = new Date(2026, 10, 1);
    expect(litCandles(season, getToday('?date=2026-12-13', now)).has('3')).toBe(true);
  });

  it('ignores weeks without a candle', () => {
    const s = structuredClone(season);
    delete s.weeks[0].candle;
    expect(litCandles(s, '2026-12-01').size).toBe(0);
  });
});

describe('weekTiming', () => {
  const timings = (date: string) =>
    season.weeks.map((w) => weekTiming(w, getSeasonState(season, date)));

  it('before the season everything is future', () => {
    expect(timings('2026-11-28')).toEqual(Array(5).fill('future'));
  });

  it('during the season splits past / current / future', () => {
    expect(timings('2026-12-14')).toEqual(['past', 'past', 'current', 'future', 'future']);
    expect(timings('2026-12-24')).toEqual(['past', 'past', 'past', 'past', 'current']);
  });

  it('after the season everything is past', () => {
    expect(timings('2026-12-26')).toEqual(Array(5).fill('past'));
  });
});
