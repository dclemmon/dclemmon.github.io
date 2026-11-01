<script lang="ts">
  import type { Snippet } from 'svelte';
  import { formatLongDate } from '../core/dates.ts';

  interface Props {
    /** App name, from the content file. */
    title: string;
    /** Free-text notice from the content file, e.g. "Sample content". */
    notice?: string;
    /** Set when a ?date= preview is active. */
    previewDate?: string;
    /** Controls shown next to the title (the view switcher). */
    controls?: Snippet;
  }
  let { title, notice, previewDate, controls }: Props = $props();
</script>

<header class="site-header">
  <div class="top">
    <h1>{title}</h1>
    {#if controls}{@render controls()}{/if}
  </div>
  {#if notice}<p class="notice">{notice}</p>{/if}
  {#if previewDate}
    <p class="notice">Previewing as if today were {formatLongDate(previewDate)}.</p>
  {/if}
</header>

<style>
  .site-header {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: var(--space-5) var(--space-4) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  h1 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
  }

  .notice {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-chip);
    background: var(--color-celebrate-bg);
    color: var(--color-text);
    font-size: var(--text-sm);
  }
</style>
