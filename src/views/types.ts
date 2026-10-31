import type { Season } from '../../content/schema.ts';
import type { SeasonState } from '../core/schedule.ts';
import type { ReactiveProgress } from '../lib/progress.svelte.ts';

/** Every view gets the same props, so views are interchangeable. */
export interface ViewProps {
  season: Season;
  seasonState: SeasonState;
  /** Set when a ?date= preview override is active. */
  previewDate?: string;
  selectedWeekId: string;
  onSelectWeek: (id: string) => void;
  progress: ReactiveProgress;
}
