<script lang="ts">
  /** Segmented control with text labels: one button per view, the chosen one pressed. */
  interface Props {
    options: { name: string; label: string }[];
    selected: string;
    onSelect: (name: string) => void;
  }
  let { options, selected, onSelect }: Props = $props();
</script>

<div class="switcher" role="group" aria-label="Choose a view">
  {#each options as option (option.name)}
    <button
      type="button"
      aria-pressed={option.name === selected}
      onclick={() => option.name !== selected && onSelect(option.name)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .switcher {
    display: inline-flex;
    padding: var(--space-1);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
  }

  button {
    min-height: var(--tap-min);
    padding: 0 var(--space-4);
    border: 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--color-text);
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    cursor: pointer;
  }

  button:hover {
    background: var(--color-bg);
  }

  button[aria-pressed='true'] {
    background: var(--color-accent-soft);
    font-weight: var(--font-weight-heavy);
  }
</style>
