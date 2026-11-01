import { describe, expect, it } from 'vitest';
import { getViewOverride, resolveView, saveView, VIEW_KEY } from './preferences.ts';
import { PROGRESS_KEY } from './progress.ts';
import { createStorage } from './storage.ts';

const VIEWS = ['wreath', 'list'] as const;

function mapBackend() {
  const m = new Map<string, string>();
  return {
    m,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

describe('view preference', () => {
  it('defaults when nothing is set', () => {
    expect(resolveView('', createStorage(mapBackend()), VIEWS, 'wreath')).toBe('wreath');
  });

  it('uses the saved choice, and ?view= beats it', () => {
    const s = createStorage(mapBackend());
    saveView(s, 'list');
    expect(resolveView('', s, VIEWS, 'wreath')).toBe('list');
    expect(resolveView('?view=wreath', s, VIEWS, 'wreath')).toBe('wreath');
  });

  it('ignores invalid ?view= and saved values', () => {
    const backend = mapBackend();
    backend.setItem(VIEW_KEY, 'calendar');
    const s = createStorage(backend);
    expect(resolveView('?view=doors', s, VIEWS, 'wreath')).toBe('wreath');
    backend.setItem(VIEW_KEY, '{"oops"');
    expect(resolveView('?view=', s, VIEWS, 'wreath')).toBe('wreath');
  });

  it('?view= is only an override: resolving never saves it', () => {
    const backend = mapBackend();
    resolveView('?view=list', createStorage(backend), VIEWS, 'wreath');
    expect(backend.getItem(VIEW_KEY)).toBeNull();
    expect(getViewOverride('?date=2026-12-10&view=list', VIEWS)).toBe('list');
    expect(getViewOverride('?view=LIST', VIEWS)).toBeUndefined();
  });

  it('works when storage throws', () => {
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    const s = createStorage(throwing);
    expect(resolveView('', s, VIEWS, 'wreath')).toBe('wreath');
    expect(() => saveView(s, 'list')).not.toThrow();
    expect(resolveView('', s, VIEWS, 'wreath')).toBe('list'); // remembered for this session
  });

  it('saving does not touch check-offs', () => {
    const backend = mapBackend();
    backend.setItem(PROGRESS_KEY, '{"w1-hope-jar":true}');
    saveView(createStorage(backend), 'list');
    expect(backend.getItem(PROGRESS_KEY)).toBe('{"w1-hope-jar":true}');
  });
});
