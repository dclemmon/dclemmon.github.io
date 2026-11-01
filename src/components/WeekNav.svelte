<script lang="ts">
  import type { Week } from '../../content/schema.ts';

  interface Props {
    weeks: Week[];
    selectedId: string;
    /** The section that matches today, labelled "this week" in the list. */
    currentId?: string;
    onSelect: (id: string) => void;
  }
  let { weeks, selectedId, currentId, onSelect }: Props = $props();

  const index = $derived(weeks.findIndex((w) => w.id === selectedId));
  const prev = $derived(index > 0 ? weeks[index - 1] : undefined);
  const next = $derived(index >= 0 && index < weeks.length - 1 ? weeks[index + 1] : undefined);
</script>

<nav aria-label="Advent weeks">
  <ul class="list">
    {#each weeks as week (week.id)}
      <li>
        <button
          type="button"
          class="pill"
          aria-current={week.id === selectedId ? 'true' : undefined}
          onclick={() => onSelect(week.id)}
        >
          {week.label}{#if week.id === currentId}<span class="now">&nbsp;(this week)</span>{/if}
        </button>
      </li>
    {/each}
  </ul>
  <div class="prevnext">
    <button class="btn" type="button" disabled={!prev} onclick={() => prev && onSelect(prev.id)}>
      <span aria-hidden="true">←</span> Previous{#if prev}<span class="visually-hidden"
          >: {prev.label}</span
        >{/if}
    </button>
    <button class="btn" type="button" disabled={!next} onclick={() => next && onSelect(next.id)}>
      Next{#if next}<span class="visually-hidden">: {next.label}</span>{/if}
      <span aria-hidden="true">→</span>
    </button>
  </div>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pill {
    min-height: var(--tap-min);
    padding: var(--space-1) var(--space-3);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
  }

  .pill:hover {
    border-color: var(--color-accent);
  }

  .pill[aria-current='true'] {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: var(--font-weight-bold);
  }

  .now {
    font-size: var(--text-sm);
  }

  .prevnext {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
  }
</style>
