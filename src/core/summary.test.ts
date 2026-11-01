import { describe, expect, it } from 'vitest';
import seasonData from '../../content/advent-2026.json';
import { parseSeason, type Season } from '../../content/schema.ts';
import { createProgress, PROGRESS_KEY } from './progress.ts';
import { getSeasonState } from './schedule.ts';
import { createStorage } from './storage.ts';
import { weekStatuses } from './summary.ts';

const season = parseSeason(seasonData);

function mapBackend() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

const byId = (s: Season, date: string, isDone: (id: string) => boolean) =>
  Object.fromEntries(weekStatuses(s, getSeasonState(s, date), isDone).map((w) => [w.weekId, w]));

describe('weekStatuses', () => {
  it('reports timing, counts and completion', () => {
    const done = new Set(['w1-light-candle', 'w1-hope-jar', 'w1-read-together', 'w2-light-candle']);
    const s = byId(season, '2026-12-08', (id) => done.has(id));
    expect(s['week-1']).toEqual({
      weekId: 'week-1',
      timing: 'past',
      done: 3,
      total: 3,
      complete: true,
    });
    expect(s['week-2']).toMatchObject({ timing: 'current', done: 1, total: 4, complete: false });
    expect(s['week-3']).toMatchObject({ timing: 'future', done: 0, complete: false });
    expect(s.christmas).toMatchObject({ timing: 'future', total: 3 });
  });

  it('marks a future week complete when it is finished early', () => {
    const s = byId(season, '2026-12-08', (id) => id.startsWith('w4-'));
    expect(s['week-4']).toMatchObject({ timing: 'future', complete: true });
  });

  it('a complete current week is both current and complete', () => {
    const s = byId(season, '2026-12-08', (id) => id.startsWith('w2-'));
    expect(s['week-2']).toMatchObject({ timing: 'current', complete: true });
  });

  it('counts saved iteration 1 check-offs after a title edit', () => {
    const backend = mapBackend();
    backend.setItem(PROGRESS_KEY, JSON.stringify({ 'w3-sing': true, 'w3-joy-gift': true }));
    const progress = createProgress(createStorage(backend));
    const edited: Season = structuredClone(season);
    edited.weeks[2].activities[1].title = 'Sing a carol (fixed)';
    const s = byId(edited, '2026-12-14', (id) => progress.isDone(id));
    expect(s['week-3']).toMatchObject({ timing: 'current', done: 2, total: 3 });
  });
});
