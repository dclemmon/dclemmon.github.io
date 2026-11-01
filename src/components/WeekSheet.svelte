<script lang="ts">
  /** A week's activities in a bottom sheet (native <dialog> via Modal). */
  import { tick } from 'svelte';
  import type { Feed, Week } from '../../content/schema.ts';
  import type { EventOccurrence } from '../core/events.ts';
  import { formatShortDate } from '../core/dates.ts';
  import { sortActivities } from '../core/schedule.ts';
  import Celebration from './Celebration.svelte';
  import CheckButton from './CheckButton.svelte';
  import EventList from './EventList.svelte';
  import Modal from './Modal.svelte';

  interface Props {
    /** The week to show; null keeps the sheet closed. */
    week: Week | null;
    isDone: (activityId: string) => boolean;
    onToggle: (activityId: string, done: boolean) => void;
    onclose: () => void;
    /** Element to return focus to when the sheet closes. */
    opener?: HTMLElement | null;
    /** The following section, if any; shows a "Next" button. */
    next?: Week;
    onNext?: (weekId: string) => void;
    /** Church events for a week, shown as "This week at church". */
    eventsFor?: (week: Week) => EventOccurrence[];
    feeds?: Feed[];
  }
  let {
    week,
    isDone,
    onToggle,
    onclose,
    opener,
    next,
    onNext,
    eventsFor,
    feeds = [],
  }: Props = $props();

  // Keep showing the last week while the dialog closes (e.g. after Android Back), so the
  // close goes through the native <dialog> and focus returns to the opener.
  let shown = $state<Week | null>(null);
  $effect.pre(() => {
    if (week) shown = week;
  });

  const activities = $derived(shown ? sortActivities(shown.activities) : []);
  const churchEvents = $derived(shown && eventsFor ? eventsFor(shown) : []);
  const complete = $derived(activities.length > 0 && activities.every((a) => isDone(a.id)));

  let heading: HTMLHeadingElement | undefined = $state();
  let body: HTMLDivElement | undefined = $state();

  async function goNext() {
    if (!next || !onNext) return;
    onNext(next.id);
    await tick();
    // New content in place: start at the top and announce the new week's title.
    body?.scrollTo({ top: 0 });
    heading?.focus();
  }
</script>

{#if shown}
  <Modal
    open={week !== null}
    variant="sheet"
    title="{shown.label} · {shown.title}"
    returnTo={opener}
    {onclose}
    bind:heading
    bind:body
  >
    <div role="status">
      {#if complete}
        <Celebration total={activities.length} message={shown.doneMessage} />
      {/if}
    </div>

    <div class="intro">
      {#if shown.theme}<p class="theme">{shown.theme}</p>{/if}
      <p>{shown.intro}</p>
    </div>

    <ul class="activities">
      {#each activities as activity (activity.id)}
        <li class="card">
          <CheckButton
            checked={isDone(activity.id)}
            describes={activity.title}
            onchange={(d) => onToggle(activity.id, d)}
          />
          <div class="text">
            {#if activity.date}<p class="date">{formatShortDate(activity.date)}</p>{/if}
            <h3>{activity.title}</h3>
            <p class="desc">{activity.description}</p>
            {#if activity.scripture}<p class="scripture">{activity.scripture}</p>{/if}
            {#if activity.details || activity.link || activity.image}
              <details class="more">
                <summary>
                  More<span class="visually-hidden"> about {activity.title}</span>
                  <svg class="chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
                    ><path d="M6 9l6 6 6-6" /></svg
                  >
                </summary>
                <div class="more-body">
                  {#if activity.image}
                    <img src={activity.image.src} alt={activity.image.alt} loading="lazy" />
                  {/if}
                  {#if activity.details}<p>{activity.details}</p>{/if}
                  {#if activity.link}
                    <p>
                      <a href={activity.link.href} target="_blank" rel="noopener noreferrer"
                        >{activity.link.label}<span class="visually-hidden">
                          (opens in a new tab)</span
                        ></a
                      >
                    </p>
                  {/if}
                </div>
              </details>
            {/if}
          </div>
        </li>
      {/each}
    </ul>

    {#if churchEvents.length > 0}
      <section class="church" aria-labelledby="sheet-church">
        <h3 id="sheet-church" class="church-title">This week at church</h3>
        <EventList events={churchEvents} {feeds} />
      </section>
    {/if}

    {#snippet actions()}
      {#if next && onNext}
        <button class="btn btn-primary next" type="button" onclick={goNext}>
          Next: {next.label} · {next.title}
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
            ><path d="M5 12h14M13 6l6 6-6 6" /></svg
          >
        </button>
      {/if}
    {/snippet}
  </Modal>
{/if}

<style>
  .next {
    gap: 0.625rem;
  }

  .next path {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .intro {
    color: var(--color-text-muted);
  }

  .theme {
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
  }

  /* Church events follow the activities as a quiet note on the sheet background. */
  .church {
    --event-rule: var(--color-border);
    margin-top: var(--space-2);
    padding: var(--space-3) var(--space-1) 0;
    border-top: 2px solid var(--color-border);
  }

  .church-title {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-muted);
  }

  .activities {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: 0.875rem;
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-body);
  }

  .desc {
    color: var(--color-text-muted);
  }

  .date {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
  }

  .scripture {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-accent);
  }

  .more summary {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap-min);
    font-weight: var(--font-weight-bold);
    color: var(--color-accent);
    cursor: pointer;
  }

  .more summary::-webkit-details-marker {
    display: none;
  }

  .chevron {
    margin-left: var(--space-1);
    transition: transform var(--motion-fast);
  }

  .chevron path {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .more[open] .chevron {
    transform: rotate(180deg);
  }

  .more-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    color: var(--color-text-muted);
  }

  /* Stand-alone links get a full-size tap target, not just the text line. */
  .more-body a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap-min);
    font-weight: var(--font-weight-bold);
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-chip);
  }
</style>
