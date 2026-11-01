<script lang="ts">
  /**
   * A week in a bottom sheet (native <dialog> via Modal): the introduction, a compact row
   * per activity, and church events. Tapping an activity shows it on its own inside the
   * same sheet, so there's only ever one dialog layer.
   */
  import { tick, untrack } from 'svelte';
  import type { Feed, Week } from '../../content/schema.ts';
  import type { EventOccurrence } from '../core/events.ts';
  import { formatLongDate, formatShortDate } from '../core/dates.ts';
  import { sortActivities } from '../core/schedule.ts';
  import Celebration from './Celebration.svelte';
  import CheckButton from './CheckButton.svelte';
  import Checkbox from './Checkbox.svelte';
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
    /** The activity shown on its own, or null for the week. The caller owns this (history). */
    activityId?: string | null;
    onOpenActivity?: (activityId: string) => void;
    /** "Back to the week" from an activity. */
    onBack?: () => void;
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
    activityId = null,
    onOpenActivity,
    onBack,
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
  const activity = $derived(
    activityId ? (activities.find((a) => a.id === activityId) ?? null) : null,
  );

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

  /*
    Keep the sheet from shrinking while it's open: going from a long week to a short
    activity shouldn't make it jump down the screen. Measured before the DOM updates.
  */
  $effect.pre(() => {
    void activity;
    const dialog = untrack(() => body)?.closest('dialog');
    if (!dialog?.open) return;
    const held = parseFloat(dialog.dataset.held ?? '0');
    const h = Math.max(held, dialog.offsetHeight);
    dialog.dataset.held = String(h);
    dialog.style.minHeight = `min(${h}px, 100dvh - var(--space-7))`;
  });

  function handleClose() {
    const dialog = body?.closest('dialog');
    dialog?.style.removeProperty('min-height');
    delete dialog?.dataset.held;
    onclose();
  }

  /*
    Moving between the week and one activity swaps the sheet's content in place: start at
    the top, then focus the activity's title, or the row it was opened from on the way back.
  */
  let list: HTMLUListElement | undefined = $state();
  let lastOpened: string | null = null;
  let shownActivity: string | null = null;
  $effect(() => {
    const id = activity?.id ?? null;
    if (id === shownActivity) return;
    const from = shownActivity;
    shownActivity = id;
    tick().then(() => {
      body?.scrollTo({ top: 0 });
      if (id) {
        lastOpened = id;
        heading?.focus();
      } else if (from && lastOpened && week) {
        list?.querySelector<HTMLElement>(`[data-activity="${lastOpened}"]`)?.focus();
      }
    });
  });
</script>

{#if shown}
  <Modal
    open={week !== null}
    variant="sheet"
    title={activity ? activity.title : `${shown.label} · ${shown.title}`}
    returnTo={opener}
    onclose={handleClose}
    bind:heading
    bind:body
  >
    {#if activity}
      <button class="back" type="button" onclick={() => onBack?.()}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
          ><path d="M15 6l-6 6 6 6" /></svg
        >
        {shown.label} · {shown.title}<span class="visually-hidden">: all activities</span>
      </button>

      <div class="detail">
        {#if activity.date}<p class="date">{formatLongDate(activity.date)}</p>{/if}
        {#if activity.image}
          <img src={activity.image.src} alt={activity.image.alt} loading="lazy" />
        {/if}
        <p class="lead">{activity.description}</p>
        {#if activity.scripture}<p class="scripture">{activity.scripture}</p>{/if}
        {#if activity.details}<p class="desc">{activity.details}</p>{/if}
        {#if activity.link}
          <p>
            <a href={activity.link.href} target="_blank" rel="noopener noreferrer"
              >{activity.link.label}<span class="visually-hidden"> (opens in a new tab)</span></a
            >
          </p>
        {/if}
      </div>
    {:else}
      <div role="status">
        {#if complete}
          <Celebration total={activities.length} message={shown.doneMessage} />
        {/if}
      </div>

      <div class="intro">
        {#if shown.theme}<p class="theme">{shown.theme}</p>{/if}
        <p>{shown.intro}</p>
      </div>

      <ul class="activities" bind:this={list}>
        {#each activities as item (item.id)}
          <li class="row">
            <CheckButton
              checked={isDone(item.id)}
              describes={item.title}
              onchange={(d) => onToggle(item.id, d)}
            />
            <button
              class="open"
              type="button"
              data-activity={item.id}
              onclick={() => onOpenActivity?.(item.id)}
            >
              <span class="text">
                {#if item.date}<span class="date">{formatShortDate(item.date)}</span>{/if}
                <span class="title">{item.title}</span>
              </span>
              <svg class="chevron" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"
                ><path d="M9 6l6 6-6 6" /></svg
              >
            </button>
          </li>
        {/each}
      </ul>

      {#if churchEvents.length > 0}
        <section class="church" aria-labelledby="sheet-church">
          <h3 id="sheet-church" class="church-title">This week at church</h3>
          <EventList events={churchEvents} {feeds} />
        </section>
      {/if}
    {/if}

    {#snippet actions()}
      {#if activity}
        <Checkbox
          block
          checked={isDone(activity.id)}
          describes={activity.title}
          onchange={(d) => onToggle(activity.id, d)}
        />
      {:else if next && onNext}
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

  .activities {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* A compact row: check it off, or tap the title to see the activity on its own. */
  .row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2) var(--space-2) 0.875rem;
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }

  .open {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    min-height: var(--tap-kid);
    padding: var(--space-1) var(--space-2);
    border: 0;
    border-radius: var(--radius-chip);
    background: none;
    color: var(--color-text);
    text-align: left;
    cursor: pointer;
  }

  .open:hover {
    background: var(--color-accent-soft);
  }

  .text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .title {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-tight);
  }

  .date {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
  }

  .chevron {
    flex: none;
    color: var(--color-accent);
  }

  .chevron path,
  .back path {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .back {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-height: var(--tap-min);
    margin-left: calc(-1 * var(--space-1));
    padding: 0 var(--space-2) 0 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
  }

  .back:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5);
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }

  .lead {
    font-size: var(--text-lg);
  }

  .desc {
    color: var(--color-text-muted);
  }

  .scripture {
    font-weight: var(--font-weight-bold);
    color: var(--color-accent);
  }

  /* Stand-alone links get a full-size tap target, not just the text line. */
  .detail a {
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
</style>
