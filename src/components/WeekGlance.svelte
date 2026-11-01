<script lang="ts">
  /**
   * A week's activities at a glance on the Wreath home page: the count, each title with a
   * small done mark, and a slot for the button that opens the week. The marks are status,
   * not controls; checking off happens in the week sheet.
   */
  import type { Snippet } from 'svelte';
  import type { Week } from '../../content/schema.ts';
  import { sortActivities } from '../core/schedule.ts';

  interface Props {
    week: Week;
    isDone: (activityId: string) => boolean;
    /** Text after "N of M", e.g. "done this week". */
    suffix?: string;
    children?: Snippet;
  }
  let { week, isDone, suffix = 'done this week', children }: Props = $props();

  const activities = $derived(sortActivities(week.activities));
  const done = $derived(activities.filter((a) => isDone(a.id)).length);
</script>

<section class="glance" aria-labelledby="glance-count">
  <p id="glance-count" class="count" role="status">{done} of {activities.length} {suffix}</p>
  <ul class="list">
    {#each activities as activity (activity.id)}
      {@const checked = isDone(activity.id)}
      <li class:checked>
        <span class="mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M5 12l5 5L20 7" /></svg>
        </span>
        <span class="name">
          {activity.title}<span class="visually-hidden">{checked ? ', done' : ''}</span>
        </span>
      </li>
    {/each}
  </ul>
  {@render children?.()}
</section>

<style>
  .glance {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }

  .count {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-muted);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0 0 var(--space-1);
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-body);
  }

  /* Small and flat on purpose, so it reads as status rather than a box to tap. */
  .mark {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 0.25em;
    border: 2px solid var(--color-current);
    border-radius: 50%;
  }

  .checked .mark {
    border-color: var(--color-done);
    background: var(--color-done);
  }

  path {
    fill: none;
    stroke: var(--color-on-accent);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
  }

  .checked path {
    opacity: 1;
  }
</style>
