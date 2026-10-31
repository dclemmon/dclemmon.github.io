<script lang="ts">
  import { tick } from 'svelte';
  import type { Activity } from '../../content/schema.ts';
  import ActivityCard from '../components/ActivityCard.svelte';
  import ActivityModal from '../components/ActivityModal.svelte';
  import CalendarLinks from '../components/CalendarLinks.svelte';
  import InstallTip from '../components/InstallTip.svelte';
  import Modal from '../components/Modal.svelte';
  import Progress from '../components/Progress.svelte';
  import WeekNav from '../components/WeekNav.svelte';
  import { formatLongDate, formatRange } from '../core/dates.ts';
  import { getWeekById, sortActivities } from '../core/schedule.ts';
  import type { ViewProps } from './types.ts';

  let { season, seasonState, previewDate, selectedWeekId, onSelectWeek, progress }: ViewProps =
    $props();

  const week = $derived(getWeekById(season, selectedWeekId) ?? season.weeks[0]);
  const activities = $derived(sortActivities(week.activities));
  const isCurrent = $derived(week.id === seasonState.currentWeekId);
  const currentWeek = $derived(getWeekById(season, seasonState.currentWeekId));

  let heading: HTMLHeadingElement | undefined = $state();
  let openActivity: Activity | null = $state(null);
  let confirmReset = $state(false);

  async function selectWeek(id: string) {
    onSelectWeek(id);
    await tick();
    // Move focus to the new week's heading so screen readers announce it.
    heading?.focus();
  }

  function resetProgress() {
    progress.resetAll();
    confirmReset = false;
  }
</script>

<div class="page">
  <header class="site-header">
    <h1>{season.title}</h1>
    {#if season.notice}<p class="notice">{season.notice}</p>{/if}
    {#if previewDate}
      <p class="notice">Previewing as if today were {formatLongDate(previewDate)}.</p>
    {/if}
  </header>

  <main>
    {#if seasonState.phase === 'before'}
      <section class="banner" aria-labelledby="banner-title">
        <h2 id="banner-title">{season.messages.beforeTitle}</h2>
        <p>{season.messages.beforeBody}</p>
      </section>
    {:else if seasonState.phase === 'after'}
      <section class="banner" aria-labelledby="banner-title">
        <h2 id="banner-title">{season.messages.afterTitle}</h2>
        <p>{season.messages.afterBody}</p>
      </section>
    {/if}

    <WeekNav
      weeks={season.weeks}
      selectedId={week.id}
      currentId={seasonState.phase === 'during' ? seasonState.currentWeekId : undefined}
      onSelect={selectWeek}
    />

    <section class="week" aria-labelledby="week-heading">
      <div class="week-head">
        <p class="eyebrow">
          {week.label} · {formatRange(week.startDate, week.endDate)}
          {#if seasonState.phase === 'before' && week.id === season.weeks[0].id}
            · Preview{/if}
        </p>
        <h2 id="week-heading" tabindex="-1" bind:this={heading}>{week.title}</h2>
        {#if week.theme}<p class="theme">{week.theme}</p>{/if}
        <p>{week.intro}</p>
      </div>

      {#if seasonState.phase === 'during' && !isCurrent && currentWeek}
        <p>
          <button class="btn" type="button" onclick={() => selectWeek(currentWeek.id)}>
            Go to this week ({currentWeek.label})
          </button>
        </p>
      {/if}

      <Progress done={progress.countDone(week)} total={week.activities.length} />

      <ul class="activities">
        {#each activities as activity (activity.id)}
          <li>
            <ActivityCard
              {activity}
              done={progress.isDone(activity.id)}
              onToggle={(d) => progress.setDone(activity.id, d)}
              onOpen={() => (openActivity = activity)}
            />
          </li>
        {/each}
      </ul>
    </section>
  </main>

  <footer class="footer">
    <p class="privacy">
      <strong>Your check-offs are saved on this device only.</strong> Nothing leaves your device.
      {#if !progress.isPersistent}
        This browser isn't saving them, so they'll clear when you close this page.
      {/if}
    </p>
    <p>
      <button class="btn" type="button" onclick={() => (confirmReset = true)}
        >Reset my progress</button
      >
    </p>
    <CalendarLinks />
    <InstallTip />
  </footer>
</div>

<ActivityModal
  activity={openActivity}
  done={openActivity ? progress.isDone(openActivity.id) : false}
  onToggle={(d) => openActivity && progress.setDone(openActivity.id, d)}
  onclose={() => (openActivity = null)}
/>

<Modal
  open={confirmReset}
  title="Reset my progress?"
  closeLabel="Cancel"
  onclose={() => (confirmReset = false)}
>
  <p>This clears every check-off on this device. It can't be undone.</p>
  {#snippet actions()}
    <button class="btn btn-primary" type="button" onclick={resetProgress}>Yes, reset</button>
  {/snippet}
</Modal>

<style>
  .page {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: var(--space-5) var(--space-4) var(--space-7);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .site-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-accent);
  }

  .notice {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--color-notice-bg);
    color: var(--color-notice-text);
    font-size: var(--text-sm);
  }

  main {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .banner {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-5);
    border-radius: var(--radius);
    background: var(--color-accent-soft);
  }

  .banner h2 {
    font-size: var(--text-xl);
  }

  .week {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .week-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .eyebrow {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  #week-heading {
    font-size: var(--text-2xl);
  }

  .theme {
    font-style: italic;
    color: var(--color-text-muted);
  }

  .activities {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-border);
  }
</style>
