import { describe, expect, it, vi } from 'vitest';
import seasonData from '../../content/advent-2026.json';
import { parseSeason, type Season } from '../../content/schema.ts';
import { createProgress, PROGRESS_KEY } from './progress.ts';
import { createStorage } from './storage.ts';

const season = parseSeason(seasonData);

function mapBackend() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

describe('progress', () => {
  it('toggles and persists by activity id', () => {
    const backend = mapBackend();
    const p = createProgress(createStorage(backend));
    expect(p.isDone('w1-light-candle')).toBe(false);
    expect(p.toggle('w1-light-candle')).toBe(true);
    expect(p.isDone('w1-light-candle')).toBe(true);

    const reloaded = createProgress(createStorage(backend));
    expect(reloaded.isDone('w1-light-candle')).toBe(true);
    expect(reloaded.toggle('w1-light-candle')).toBe(false);
    expect(reloaded.isDone('w1-light-candle')).toBe(false);
  });

  it('counts done activities in a week', () => {
    const p = createProgress(createStorage(mapBackend()));
    p.setDone('w1-light-candle', true);
    p.setDone('w1-hope-jar', true);
    p.setDone('w2-light-candle', true);
    expect(p.countDone(season.weeks[0])).toBe(2);
    expect(p.countDone(season.weeks[1])).toBe(1);
  });

  it('resetAll clears everything, including storage', () => {
    const backend = mapBackend();
    const p = createProgress(createStorage(backend));
    p.setDone('w1-light-candle', true);
    p.resetAll();
    expect(p.isDone('w1-light-candle')).toBe(false);
    expect(backend.getItem(PROGRESS_KEY)).toBeNull();
  });

  it('ignores corrupt or wrongly shaped saved data', () => {
    for (const raw of ['{oops', '[1,2]', '"text"', '{"a":"yes","b":true}']) {
      const backend = mapBackend();
      backend.setItem(PROGRESS_KEY, raw);
      const p = createProgress(createStorage(backend));
      expect(p.isDone('a')).toBe(false);
      expect(p.isDone('b')).toBe(raw.includes('"b":true'));
    }
  });

  it('keeps a check-off when the activity title is edited', () => {
    const backend = mapBackend();
    createProgress(createStorage(backend)).setDone('w1-light-candle', true);

    const edited: Season = structuredClone(season);
    edited.weeks[0].activities[0].title = 'Light the first candle (fixed typo)';
    const p = createProgress(createStorage(backend));
    expect(p.isDone(edited.weeks[0].activities[0].id)).toBe(true);
    expect(p.countDone(edited.weeks[0])).toBe(1);
  });

  it('works without persistent storage', () => {
    const p = createProgress(createStorage(null));
    expect(p.isPersistent).toBe(false);
    p.toggle('x');
    expect(p.isDone('x')).toBe(true);
  });

  it('notifies subscribers', () => {
    const p = createProgress(createStorage(mapBackend()));
    const fn = vi.fn();
    const off = p.subscribe(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    p.toggle('x');
    p.setDone('x', true); // no change → no notify
    p.resetAll();
    expect(fn).toHaveBeenCalledTimes(3);
    off();
    p.toggle('x');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
