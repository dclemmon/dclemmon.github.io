<script lang="ts">
  interface Props {
    done: number;
    total: number;
    /** Text after "N of M", e.g. "done this week". */
    suffix?: string;
    /** "text" (week list) or "dots" (a card with one dot per activity). */
    variant?: 'text' | 'dots';
  }
  let { done, total, suffix = 'done this week', variant = 'text' }: Props = $props();
</script>

{#if variant === 'dots'}
  <div class="card" role="status">
    <span class="dots" aria-hidden="true">
      {#each Array.from({ length: total }, (_, i) => i < done) as filled, i (i)}
        <span class="dot" class:filled></span>
      {/each}
    </span>
    <span class="label">{done} of {total} {suffix}</span>
  </div>
{:else}
  <p class="progress" role="status">
    <strong>{done} of {total}</strong>
    {suffix}{#if total > 0 && done === total}&nbsp;— all done!{/if}
  </p>
{/if}

<style>
  .progress {
    color: var(--color-text-muted);
  }

  strong {
    color: var(--color-text);
  }

  .card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-chip);
    background: var(--color-surface);
  }

  .dots {
    display: flex;
    flex: none;
    gap: 0.375rem;
  }

  .dot {
    width: 1.375rem;
    height: 1.375rem;
    border: 3px solid var(--color-border);
    border-radius: 50%;
  }

  .dot.filled {
    border-color: var(--color-current);
    background: var(--color-current);
  }

  .label {
    font-weight: var(--font-weight-bold);
  }
</style>
