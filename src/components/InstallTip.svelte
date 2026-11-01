<script lang="ts">
  interface Props {
    /** Show the tip directly (e.g. inside a dialog) instead of in a collapsible panel. */
    inline?: boolean;
  }
  let { inline = false }: Props = $props();
</script>

{#snippet content()}
  <div class="content">
    <p>
      <strong>iPhone or iPad (Safari):</strong> tap the Share button (a square with an arrow), then “Add
      to Home Screen”.
    </p>
    <p>
      <strong>Android (Chrome):</strong> tap the menu (three dots), then “Add to Home screen” or “Install
      app”.
    </p>
    <p class="note">
      Check-offs saved in your browser don't carry over to the Home Screen icon. They start fresh
      there.
    </p>
  </div>
{/snippet}

{#if inline}
  {@render content()}
{:else}
  <details class="panel">
    <summary>Add this page to my Home Screen</summary>
    {@render content()}
  </details>
{/if}

<style>
  .panel summary {
    min-height: var(--tap-min);
    display: flex;
    align-items: center;
    font-weight: var(--font-weight-bold);
    color: var(--color-accent);
    cursor: pointer;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }

  .note {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
