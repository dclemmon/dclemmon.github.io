/**
 * A localStorage wrapper that never throws. If storage is missing or blocked
 * (private browsing, in-app browsers, quota), it falls back to memory so the
 * app keeps working; data just won't survive a reload.
 */

export interface SafeStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  getJSON<T>(key: string): T | null;
  setJSON(key: string, value: unknown): void;
  /** False when using the in-memory fallback. */
  readonly isPersistent: boolean;
}

type Backend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function probe(backend: Backend | null | undefined): Backend | null {
  if (!backend) return null;
  try {
    const k = '__advent_probe__';
    backend.setItem(k, '1');
    backend.removeItem(k);
    return backend;
  } catch {
    return null;
  }
}

function defaultBackend(): Backend | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Accessing window.localStorage itself can throw (e.g. blocked cookies).
    return null;
  }
}

export function createStorage(backend: Backend | null | undefined = defaultBackend()): SafeStorage {
  const memory = new Map<string, string>();
  let real = probe(backend);

  const fallBack = () => {
    real = null;
  };

  return {
    get isPersistent() {
      return real !== null;
    },
    get(key) {
      if (real) {
        try {
          return real.getItem(key);
        } catch {
          fallBack();
        }
      }
      return memory.get(key) ?? null;
    },
    set(key, value) {
      memory.set(key, value);
      if (real) {
        try {
          real.setItem(key, value);
        } catch {
          fallBack();
        }
      }
    },
    remove(key) {
      memory.delete(key);
      if (real) {
        try {
          real.removeItem(key);
        } catch {
          fallBack();
        }
      }
    },
    getJSON<T>(key: string): T | null {
      const raw = this.get(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    setJSON(key, value) {
      try {
        this.set(key, JSON.stringify(value));
      } catch {
        // Unserializable value; ignore.
      }
    },
  };
}
