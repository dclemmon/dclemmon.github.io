<script lang="ts">
  import type { Activity } from '../../content/schema.ts';
  import { formatShortDate } from '../core/dates.ts';
  import Checkbox from './Checkbox.svelte';

  interface Props {
    activity: Activity;
    done: boolean;
    onToggle: (done: boolean) => void;
    /** Called when the user asks for more detail. Omit to hide the button. */
    onOpen?: () => void;
  }
  let { activity, done, onToggle, onOpen }: Props = $props();

  const hasMore = $derived(Boolean(activity.details || activity.link || activity.image));
</script>

<article class="card" class:done aria-labelledby="act-{activity.id}">
  {#if activity.date}<p class="date">{formatShortDate(activity.date)}</p>{/if}
  <h3 id="act-{activity.id}">{activity.title}</h3>
  <p>{activity.description}</p>
  {#if activity.scripture}<p class="scripture">Scripture: {activity.scripture}</p>{/if}
  <div class="row">
    <Checkbox checked={done} describes={activity.title} onchange={onToggle} />
    {#if hasMore && onOpen}
      <button class="btn" type="button" onclick={onOpen}>
        More<span class="visually-hidden"> about {activity.title}</span>
      </button>
    {/if}
  </div>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5);
    border: 2px solid var(--color-surface);
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow);
  }

  .card.done {
    border-color: var(--color-done-bg);
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
  }

  p {
    color: var(--color-text-muted);
  }

  .date {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .scripture {
    color: var(--color-accent);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }
</style>
