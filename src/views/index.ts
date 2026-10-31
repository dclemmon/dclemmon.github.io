import type { Component } from 'svelte';
import GuideView from './GuideView.svelte';
import type { ViewProps } from './types.ts';

/**
 * Registry of presentations. To add one (e.g. an animated calendar):
 * create src/views/CalendarView.svelte taking ViewProps, add it here,
 * and set `view` in src/config.ts.
 */
export const views = {
  guide: GuideView,
  // calendar: CalendarView,
} satisfies Record<string, Component<ViewProps>>;

export type ViewName = keyof typeof views;
