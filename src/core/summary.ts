/**
 * Per-week facts for progress displays (week chips, progress rows).
 * Plain data only: views decide how each state looks.
 */
import type { Season } from '../../content/schema.ts';
import { weekTiming, type SeasonState, type WeekTiming } from './schedule.ts';

export interface WeekStatus {
  weekId: string;
  timing: WeekTiming;
  /** Activities checked off in this week. */
  done: number;
  total: number;
  /** Every activity is checked off (weeks can be finished early; gating is advisory). */
  complete: boolean;
}

export function weekStatuses(
  season: Season,
  state: SeasonState,
  isDone: (activityId: string) => boolean,
): WeekStatus[] {
  return season.weeks.map((week) => {
    const total = week.activities.length;
    const done = week.activities.filter((a) => isDone(a.id)).length;
    return {
      weekId: week.id,
      timing: weekTiming(week, state),
      done,
      total,
      complete: total > 0 && done === total,
    };
  });
}
