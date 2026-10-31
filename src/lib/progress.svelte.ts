/**
 * Svelte glue: wraps the framework-free Progress so templates re-render on change.
 */
import type { Week } from '../../content/schema.ts';
import type { Progress } from '../core/progress.ts';

export interface ReactiveProgress {
  isDone(id: string): boolean;
  setDone(id: string, done: boolean): void;
  countDone(week: Week): number;
  resetAll(): void;
  readonly isPersistent: boolean;
}

export function reactiveProgress(progress: Progress): ReactiveProgress {
  let version = $state(0);
  progress.subscribe(() => {
    version++;
  });
  return {
    isDone(id) {
      void version;
      return progress.isDone(id);
    },
    countDone(week) {
      void version;
      return progress.countDone(week);
    },
    setDone: (id, done) => progress.setDone(id, done),
    resetAll: () => progress.resetAll(),
    get isPersistent() {
      void version;
      return progress.isPersistent;
    },
  };
}
