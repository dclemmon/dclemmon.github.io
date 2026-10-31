import { describe, expect, it } from 'vitest';
import { createStorage } from './storage.ts';

function mapBackend() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

const throwing = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('createStorage', () => {
  it('persists to a working backend', () => {
    const backend = mapBackend();
    const s = createStorage(backend);
    expect(s.isPersistent).toBe(true);
    s.setJSON('k', { a: 1 });
    expect(createStorage(backend).getJSON('k')).toEqual({ a: 1 });
  });

  it('falls back to memory when storage throws', () => {
    const s = createStorage(throwing);
    expect(s.isPersistent).toBe(false);
    expect(() => s.set('k', 'v')).not.toThrow();
    expect(s.get('k')).toBe('v');
    s.remove('k');
    expect(s.get('k')).toBeNull();
  });

  it('falls back to memory when storage is missing', () => {
    const s = createStorage(null);
    expect(s.isPersistent).toBe(false);
    s.set('k', 'v');
    expect(s.get('k')).toBe('v');
  });

  it('falls back if storage starts failing later', () => {
    const backend = mapBackend();
    const s = createStorage(backend);
    backend.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => s.set('k', 'v')).not.toThrow();
    expect(s.isPersistent).toBe(false);
    expect(s.get('k')).toBe('v');
  });

  it('returns null for corrupt JSON', () => {
    const backend = mapBackend();
    backend.setItem('k', '{not json');
    expect(createStorage(backend).getJSON('k')).toBeNull();
  });
});
