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
  /**
   * A week asked for by a link (#week-id), e.g. from a calendar reminder. A new object
   * each time a link is followed, so views can react even to the same week twice.
   */
  linkedWeek?: { id: string };
  progress: ReactiveProgress;
}
