<script lang="ts">
  import { untrack } from 'svelte';
  import CalendarLinks from '../components/CalendarLinks.svelte';
  import EventList from '../components/EventList.svelte';
  import InstallTip from '../components/InstallTip.svelte';
  import Modal from '../components/Modal.svelte';
  import Progress from '../components/Progress.svelte';
  import WeekSheet from '../components/WeekSheet.svelte';
  import WeekChips from '../components/WeekChips.svelte';
  import Wreath from '../components/Wreath.svelte';
  import { formatRangeCompact, formatShortDate, formatTime } from '../core/dates.ts';
  import { eventsInWeek, nextEvent, upcomingEvents } from '../core/events.ts';
  import { getWeekById, litCandles, nextWeek } from '../core/schedule.ts';
  import { weekStatuses } from '../core/summary.ts';
  import type { ViewProps } from './types.ts';

  let { season, seasonState, onSelectWeek, progress, linkedWeek }: ViewProps = $props();

  // The hero always reflects today's date; chips open any week.
  const week = $derived(getWeekById(season, seasonState.currentWeekId) ?? season.weeks[0]);
  const lit = $derived(litCandles(season, seasonState.today));
  const statuses = $derived(weekStatuses(season, seasonState, (id) => progress.isDone(id)));
  const status = $derived(statuses.find((s) => s.weekId === week.id));

  const buttonLabel = $derived(
    seasonState.phase === 'before'
      ? `Preview ${week.label}`
      : seasonState.phase === 'after'
        ? `See ${week.label} activities`
        : "See this week's activities",
  );

  let sheetWeekId: string | null = $state(null);
  let opener: HTMLElement | null = $state(null);
  const sheetWeek = $derived(sheetWeekId ? (getWeekById(season, sheetWeekId) ?? null) : null);

  /*
    Android Back: opening a sheet (a week, the events list, the calendar or Home Screen
    help) adds one history entry, so Back closes it instead of leaving the app. Opening an
    activity inside the week sheet adds a second, so Back first returns to the week.
    "Next" replaces the week's entry. `depth` counts the entries we've added.
  */
  const SHEET_STATE = 'advent-sheet';
  let depth = 0;

  let infoDialog: 'calendar' | 'install' | 'events' | null = $state(null);
  let activityId: string | null = $state(null);

  function push(state: string) {
    history.pushState({ [SHEET_STATE]: state }, '');
    depth += 1;
  }

  function openInfo(kind: 'calendar' | 'install' | 'events') {
    infoDialog = kind;
    push(kind);
  }

  /** Closed with the button, Escape or the backdrop: remove the entries we added. */
  function popOurEntries() {
    if (depth > 0) {
      const n = depth;
      depth = 0; // so the popstate this causes isn't taken for the user's Back
      history.go(-n);
    }
  }

  function onInfoClosed() {
    infoDialog = null;
    popOurEntries();
  }

  function openWeek(id: string, from: HTMLElement | null = null) {
    opener = from;
    onSelectWeek(id); // may tidy the URL (drops a #week hash) before we add our entry
    if (sheetWeekId === null) {
      push(id);
    } else {
      history.replaceState({ [SHEET_STATE]: id }, '');
    }
    sheetWeekId = id;
  }

  function showNextWeek(id: string) {
    sheetWeekId = id;
    onSelectWeek(id);
    history.replaceState({ [SHEET_STATE]: id }, '');
  }

  function openActivity(id: string) {
    activityId = id;
    push(`${sheetWeekId}/${id}`);
  }

  /** The sheet's "back to the week" link does what Android Back does. */
  function backToWeek() {
    if (depth > 1) history.back();
    else activityId = null;
  }

  function onSheetClosed() {
    sheetWeekId = null;
    activityId = null;
    popOurEntries();
  }

  $effect(() => {
    const onPop = () => {
      if (depth === 0) return;
      depth -= 1;
      // Back (or a swipe): leave the activity first, then close the sheet.
      if (activityId !== null && sheetWeekId !== null) {
        activityId = null;
      } else {
        sheetWeekId = null;
        infoDialog = null;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  });

  // A #week-id link (e.g. from a calendar reminder) opens that week's sheet. Only a new
  // link should re-run this, not the sheet state openWeek reads, hence untrack.
  $effect(() => {
    const link = linkedWeek;
    if (link) untrack(() => openWeek(link.id));
  });

  const upcoming = $derived(upcomingEvents(season, seasonState.today));
  // One quiet line on the home page; the full list (cancellations included) is a tap away.
  const next = $derived(nextEvent(season, seasonState.today));
</script>

<main class="page">
  <div class="title">
    {#if seasonState.phase === 'during'}
      <p class="dates">
        {formatRangeCompact(week.startDate, week.endDate)}{week.theme ? ` · ${week.theme}` : ''}
      </p>
      <h2>{week.label} · {week.title}</h2>
      <p class="intro">{week.intro}</p>
    {:else if seasonState.phase === 'before'}
      <h2>{season.messages.beforeTitle}</h2>
      <p class="intro">{season.messages.beforeBody}</p>
    {:else}
      <h2>{season.messages.afterTitle}</h2>
      <p class="intro">{season.messages.afterBody}</p>
    {/if}
  </div>

  <Wreath {lit} />

  {#if status}
    <Progress
      variant="dots"
      done={status.done}
      total={status.total}
      suffix={seasonState.phase === 'during' ? 'done this week' : `done in ${week.label}`}
    />
  {/if}

  <WeekChips weeks={season.weeks} {statuses} onOpen={openWeek} />

  <button class="btn btn-primary" type="button" onclick={(e) => openWeek(week.id, e.currentTarget)}>
    {buttonLabel}
  </button>

  {#if upcoming.length > 0}
    <section class="church" aria-labelledby="next-at-church">
      {#if next}
        <p>
          <span id="next-at-church" class="church-label">Next at church:</span>
          <strong>{next.event.title}</strong>,
          {formatShortDate(next.date)}{#if next.event.start},
            <span class="nowrap">{formatTime(next.event.start)}</span>{/if}
        </p>
      {:else}
        <h3 id="next-at-church" class="church-label">At church</h3>
      {/if}
      <button class="link" type="button" onclick={() => openInfo('events')}>
        See all church events
      </button>
    </section>
  {/if}

  <footer class="footer">
    <p>
      Check marks stay on this device.{#if !progress.isPersistent}
        This browser isn't saving them, so they'll clear when you close this page.{/if}
    </p>
    <div class="links">
      <button class="link" type="button" onclick={() => openInfo('calendar')}>
        Get reminders and events
      </button>
      <button class="link" type="button" onclick={() => openInfo('install')}>
        Add to Home Screen
      </button>
    </div>
  </footer>
</main>

<WeekSheet
  week={sheetWeek}
  isDone={(id) => progress.isDone(id)}
  onToggle={(id, d) => progress.setDone(id, d)}
  onclose={onSheetClosed}
  {opener}
  next={sheetWeekId ? nextWeek(season, sheetWeekId) : undefined}
  onNext={showNextWeek}
  eventsFor={(w) => eventsInWeek(season, w)}
  feeds={season.feeds}
  {activityId}
  onOpenActivity={openActivity}
  onBack={backToWeek}
/>

<Modal
  open={infoDialog === 'events'}
  title="Coming up at church"
  variant="sheet"
  focusTitle
  onclose={onInfoClosed}
>
  <div class="all-events">
    <EventList events={upcoming} feeds={season.feeds} details />
  </div>
</Modal>

<Modal
  open={infoDialog === 'calendar'}
  title="Reminders and events"
  variant="sheet"
  focusTitle
  onclose={onInfoClosed}
>
  <CalendarLinks feeds={season.feeds} inline />
</Modal>

<Modal
  open={infoDialog === 'install'}
  title="Add to Home Screen"
  variant="sheet"
  focusTitle
  onclose={onInfoClosed}
>
  <InstallTip inline />
</Modal>

<style>
  .page {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: var(--space-4) var(--space-4) var(--space-7);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .title {
    display: flex;
    flex-direction: column;
  }

  .dates {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
  }

  h2 {
    font-size: var(--text-2xl);
  }

  .intro {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-top: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--space-6);
  }

  .link {
    min-height: var(--tap-min);
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
    text-decoration: underline;
    text-underline-offset: 0.15em;
    cursor: pointer;
  }

  .link:hover {
    color: var(--color-accent-hover);
  }

  /* Church events stay a quiet line under the devotion, not a second card. */
  .church {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: var(--space-3);
    border-top: 2px solid var(--color-border);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .church strong {
    color: var(--color-text);
  }

  .nowrap {
    white-space: nowrap;
  }

  .church-label {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
  }

  .all-events {
    padding: 0 var(--space-4);
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }
</style>
