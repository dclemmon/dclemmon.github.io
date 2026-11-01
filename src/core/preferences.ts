/**
 * The family's chosen presentation, saved on this device only.
 * Generic over the allowed names, so core knows nothing about specific views.
 */
import type { SafeStorage } from './storage.ts';

export const VIEW_KEY = 'advent:view:v1';

/** A valid `?view=` value, if present. Used for links and QA; never saved. */
export function getViewOverride<T extends string>(
  search: string,
  allowed: readonly T[],
): T | undefined {
  const v = new URLSearchParams(search).get('view');
  return allowed.find((name) => name === v);
}

/** `?view=` wins, then the saved choice, then `fallback`. Invalid values are ignored. */
export function resolveView<T extends string>(
  search: string,
  storage: SafeStorage,
  allowed: readonly T[],
  fallback: T,
): T {
  const override = getViewOverride(search, allowed);
  if (override) return override;
  const saved = storage.get(VIEW_KEY);
  return allowed.find((name) => name === saved) ?? fallback;
}

export function saveView(storage: SafeStorage, name: string): void {
  storage.set(VIEW_KEY, name);
}
