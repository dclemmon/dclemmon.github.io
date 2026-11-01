<script lang="ts">
  /** A list of church event dates: when, what, where, with its type and any cancellation. */
  import type { Feed } from '../../content/schema.ts';
  import { formatShortDate, formatTimeRange } from '../core/dates.ts';
  import type { EventOccurrence } from '../core/events.ts';

  interface Props {
    events: EventOccurrence[];
    feeds: Feed[];
    /** Show each event's description (off for compact lists). */
    details?: boolean;
  }
  let { events, feeds, details = false }: Props = $props();

  const label = (feedId: string) => feeds.find((f) => f.id === feedId)?.label;
</script>

<ul class="events">
  {#each events as { event, date, key } (key)}
    <li class="event" class:cancelled={event.cancelled}>
      <p class="when">
        {formatShortDate(date)} · {formatTimeRange(event.start, event.end)}
      </p>
      <p class="title">
        <span class="name">{event.title}</span>
        {#if event.cancelled}
          <span class="tag cancel">Cancelled</span>
        {:else if label(event.feed)}
          <span class="tag">{label(event.feed)}</span>
        {/if}
      </p>
      {#if event.location}<p class="where">{event.location}</p>{/if}
      {#if details && event.description}<p class="desc">{event.description}</p>{/if}
    </li>
  {/each}
</ul>

<style>
  .events {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .event {
    padding: var(--space-3) 0;
  }

  /* Rule between events; a list shown on the page background sets --event-rule. */
  .event + .event {
    border-top: 2px solid var(--event-rule, var(--color-bg));
  }

  .when {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
  }

  .title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-tight);
  }

  .cancelled .name {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }

  .tag {
    padding: 0.125rem var(--space-2);
    border-radius: var(--radius-pill);
    background: var(--color-accent-soft);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-bold);
  }

  .tag.cancel {
    background: var(--color-celebrate-bg);
    border: 1px solid var(--color-text-muted);
  }

  .where,
  .desc {
    color: var(--color-text-muted);
  }

  .desc {
    margin-top: var(--space-1);
  }
</style>
