<script lang="ts">
  import Progress from '../components/Progress.svelte';
  import WeekChips from '../components/WeekChips.svelte';
  import Wreath from '../components/Wreath.svelte';
  import { formatRangeCompact } from '../core/dates.ts';
  import { getWeekById, litCandles } from '../core/schedule.ts';
  import { weekStatuses } from '../core/summary.ts';
  import type { ViewProps } from './types.ts';

  let { season, seasonState, onSelectWeek, progress }: ViewProps = $props();

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

  function openWeek(id: string) {
    // The week sheet arrives in the next step; for now this only selects the week.
    onSelectWeek(id);
  }
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

  <WeekChips weeks={season.weeks} {statuses} onOpen={(id) => openWeek(id)} />

  <button class="btn btn-primary" type="button" onclick={() => openWeek(week.id)}>
    {buttonLabel}
  </button>

  <footer class="footer">
    <p>Check marks stay on this device.</p>
    {#if !progress.isPersistent}
      <p>This browser isn't saving them, so they'll clear when you close this page.</p>
    {/if}
  </footer>
</main>

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
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
</style>
