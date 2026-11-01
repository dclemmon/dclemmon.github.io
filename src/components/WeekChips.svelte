<script lang="ts">
  /**
   * One button per section, showing its state in words (Done / Now / start date),
   * never by color alone. Past weeks that aren't finished look neutral: no "missed" cue.
   */
  import type { Week } from '../../content/schema.ts';
  import { formatMonthDay } from '../core/dates.ts';
  import type { WeekStatus } from '../core/summary.ts';

  interface Props {
    weeks: Week[];
    statuses: WeekStatus[];
    onOpen: (weekId: string, opener: HTMLElement) => void;
  }
  let { weeks, statuses, onOpen }: Props = $props();

  const chips = $derived(
    weeks.map((week) => {
      const status = statuses.find((s) => s.weekId === week.id);
      const name = week.shortTitle ?? week.title;
      const sub = status?.complete
        ? 'Done'
        : status?.timing === 'current'
          ? 'Now'
          : formatMonthDay(week.startDate);
      const parts = [name, sub];
      if (status?.timing === 'current' && status.complete) parts.push('this week');
      if (status) parts.push(`${status.done} of ${status.total} done`);
      return { week, status, name, sub, label: parts.join(', ') };
    }),
  );
</script>

<ul class="chips" aria-label="Weeks">
  {#each chips as chip (chip.week.id)}
    <li>
      <button
        type="button"
        class="chip"
        class:done={chip.status?.complete}
        class:current={chip.status?.timing === 'current'}
        class:future={chip.status?.timing === 'future' && !chip.status.complete}
        aria-label={chip.label}
        aria-current={chip.status?.timing === 'current' ? 'date' : undefined}
        onclick={(e) => onOpen(chip.week.id, e.currentTarget)}
      >
        <span class="name">{chip.name}</span>
        <span class="sub">
          {#if chip.status?.complete}
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M5 12l5 5L20 7" />
            </svg>
          {/if}
          {chip.sub}
        </span>
      </button>
    </li>
  {/each}
</ul>

<style>
  .chips {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .chip {
    width: 100%;
    height: 100%;
    min-height: 4.125rem; /* 66px, above the 56px kid minimum */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    border: 3px solid transparent;
    border-radius: var(--radius-chip);
    background: var(--color-surface);
    color: var(--color-text);
    line-height: var(--line-tight);
    cursor: pointer;
  }

  .chip:hover {
    border-color: var(--color-border);
  }

  .chip.future {
    background: var(--color-surface-muted);
  }

  .chip.done {
    background: var(--color-done-bg);
  }

  .chip.current,
  .chip.current:hover {
    border-color: var(--color-current);
  }

  .name {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
    overflow-wrap: anywhere;
  }

  .current .name {
    font-weight: var(--font-weight-heavy);
  }

  .sub {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .done .sub {
    color: var(--color-text);
  }

  .sub path {
    fill: none;
    stroke: var(--color-done);
    stroke-width: 3.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
