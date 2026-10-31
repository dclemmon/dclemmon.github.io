/**
 * Local check-offs, keyed by stable activity ID. Never sent anywhere.
 * Framework-free: views subscribe() to be told about changes.
 */
import type { Week } from '../../content/schema.ts';
import type { SafeStorage } from './storage.ts';

export const PROGRESS_KEY = 'advent-2026:progress:v1';

type DoneMap = Record<string, true>;

export interface Progress {
  isDone(activityId: string): boolean;
  setDone(activityId: string, done: boolean): void;
  toggle(activityId: string): boolean;
  /** Number of the week's activities that are checked off. */
  countDone(week: Week): number;
  resetAll(): void;
  /** Called immediately, then after every change. Returns an unsubscribe function. */
  subscribe(fn: () => void): () => void;
  readonly isPersistent: boolean;
}

function load(storage: SafeStorage): DoneMap {
  const raw = storage.getJSON<unknown>(PROGRESS_KEY);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const out: DoneMap = {};
  for (const [k, v] of Object.entries(raw)) if (v === true) out[k] = true;
  return out;
}

export function createProgress(storage: SafeStorage): Progress {
  let done = load(storage);
  const listeners = new Set<() => void>();

  const commit = () => {
    storage.setJSON(PROGRESS_KEY, done);
    listeners.forEach((fn) => fn());
  };

  return {
    get isPersistent() {
      return storage.isPersistent;
    },
    isDone: (id) => done[id] === true,
    setDone(id, value) {
      if ((done[id] === true) === value) return;
      done = { ...done };
      if (value) done[id] = true;
      else delete done[id];
      commit();
    },
    toggle(id) {
      const next = done[id] !== true;
      this.setDone(id, next);
      return next;
    },
    countDone: (week) => week.activities.filter((a) => done[a.id] === true).length,
    resetAll() {
      done = {};
      storage.remove(PROGRESS_KEY);
      listeners.forEach((fn) => fn());
    },
    subscribe(fn) {
      listeners.add(fn);
      fn();
      return () => listeners.delete(fn);
    },
  };
}
