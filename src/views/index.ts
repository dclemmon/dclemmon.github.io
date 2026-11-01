import type { Component } from 'svelte';
import GuideView from './GuideView.svelte';
import type { ViewProps } from './types.ts';

interface ViewEntry {
  component: Component<ViewProps>;
  /** Visible label in the view switcher. */
  label: string;
}

/**
 * Registry of presentations. To add one: create src/views/<Name>View.svelte taking
 * ViewProps and add it here. The key is what ?view= and the saved choice use.
 * Core and content don't change.
 */
export const views = {
  list: { component: GuideView, label: 'Week list' },
} satisfies Record<string, ViewEntry>;

export type ViewName = keyof typeof views;

export const viewNames = Object.keys(views) as ViewName[];
