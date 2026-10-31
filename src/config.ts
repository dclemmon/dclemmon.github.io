/**
 * App configuration. `view` picks which presentation renders; adding a new view
 * means adding it to src/views/index.ts — core and content don't change.
 */
import seasonData from '../content/advent-2026.json';
import { parseSeason } from '../content/schema.ts';
import type { ViewName } from './views/index.ts';

export const config: { view: ViewName } = {
  view: 'guide',
};

export const season = parseSeason(seasonData);
