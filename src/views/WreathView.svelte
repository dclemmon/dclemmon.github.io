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
  import { formatRangeCompact } from '../core/dates.ts';
  import { eventsInWeek, upcomingEvents } from '../core/events.ts';
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
    help) adds one history entry, so Back closes it instead of leaving the app. "Next"
    replaces that entry, so one Back always closes the week sheet.
  */
  const SHEET_STATE = 'advent-sheet';
  let pushedHistory = false;

  let infoDialog: 'calendar' | 'install' | 'events' | null = $state(null);

  function openInfo(kind: 'calendar' | 'install' | 'events') {
    infoDialog = kind;
    history.pushState({ [SHEET_STATE]: kind }, '');
    pushedHistory = true;
  }

  /** Closed with the button, Escape or the backdrop: remove the entry we added. */
  function popOurEntry() {
    if (pushedHistory) {
      pushedHistory = false;
      history.back();
    }
  }

  function onInfoClosed() {
    infoDialog = null;
    popOurEntry();
  }

  function openWeek(id: string, from: HTMLElement | null = null) {
    opener = from;
    onSelectWeek(id); // may tidy the URL (drops a #week hash) before we add our entry
    if (sheetWeekId === null) {
      history.pushState({ [SHEET_STATE]: id }, '');
      pushedHistory = true;
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

  function onSheetClosed() {
    sheetWeekId = null;
    popOurEntry();
  }

  $effect(() => {
    const onPop = () => {
      // Back (or a swipe) while a sheet is open: just close it.
      if (pushedHistory && (sheetWeekId !== null || infoDialog !== null)) {
        pushedHistory = false;
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
  const COMING_UP = 3;
</script>

<main class="page">
  <div class="title">
    {#if seasonState.phase === 'during'}
      <p class="dates">{formatRangeCompact(week.startDate, week.endDate)}</p>
      <h2>{week.label} · {week.title}</h2>
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
    <section class="coming-up" aria-labelledby="coming-up">
      <h3 id="coming-up">Coming up</h3>
      <EventList events={upcoming.slice(0, COMING_UP)} feeds={season.feeds} />
      <button class="link" type="button" onclick={() => openInfo('events')}>
        See all events
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
        Add to calendar
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
  title="Add to my calendar"
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

  .coming-up {
    display: flex;
    flex-direction: column;
    padding: var(--space-4) var(--space-4) var(--space-1);
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }

  .coming-up h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-heavy);
  }

  .coming-up .link {
    align-self: flex-start;
  }

  .all-events {
    padding: 0 var(--space-4);
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }
</style>
