import { describe, expect, it } from 'vitest';
import seasonData from '../../content/advent-2026.json';
import { parseSeason } from '../../content/schema.ts';
import {
  getActivitiesForDate,
  getSeasonState,
  getToday,
  nextWeek,
  prevWeek,
  sortActivities,
  weekIdFromHash,
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
