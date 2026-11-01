<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    children: Snippet;
    /** Optional footer actions. The "dialog" variant always adds a Close button after them. */
    actions?: Snippet;
    closeLabel?: string;
    /**
     * "dialog": centered card with a Close button in the footer (default).
     * "sheet": docked to the bottom of the screen, with a round close button in the header.
     */
    variant?: 'dialog' | 'sheet';
    /** The title element, so callers can move focus to it (e.g. after changing content). */
    heading?: HTMLHeadingElement;
    /** The scrolling body, so callers can scroll it back to the top. */
    body?: HTMLDivElement;
    /**
     * Where focus goes when the dialog closes. Defaults to whatever had focus when it
     * opened (Safari doesn't focus buttons on click, so callers can pass the opener).
     */
    returnTo?: HTMLElement | null;
  }
  let {
    open,
    title,
    onclose,
    children,
    actions,
    closeLabel = 'Close',
    variant = 'dialog',
    heading = $bindable(),
    body = $bindable(),
    returnTo,
  }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  let returnFocus: HTMLElement | null = null;
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus = returnTo ?? (document.activeElement as HTMLElement | null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  function handleClose() {
    onclose();
    // Return focus to whatever opened the dialog (not all browsers do this).
    returnFocus?.focus();
    returnFocus = null;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialog) dialog?.close();
  }
</script>

<dialog
  bind:this={dialog}
  class={variant}
  aria-labelledby={titleId}
  onclose={handleClose}
  onclick={handleBackdropClick}
>
  <div class="inner">
    <div class="header">
      <h2 id={titleId} tabindex="-1" bind:this={heading}>{title}</h2>
      {#if variant === 'sheet'}
        <!-- svelte-ignore a11y_autofocus -->
        <button
          class="close-round"
          type="button"
          autofocus
          aria-label={closeLabel}
          onclick={() => dialog?.close()}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      {/if}
    </div>
    <div class="body" bind:this={body}>{@render children()}</div>
    {#if variant === 'dialog' || actions}
      <div class="actions">
        {#if actions}{@render actions()}{/if}
        {#if variant === 'dialog'}
          <!-- svelte-ignore a11y_autofocus -->
          <button class="btn" type="button" autofocus onclick={() => dialog?.close()}
            >{closeLabel}</button
          >
        {/if}
      </div>
    {/if}
  </div>
</dialog>

<style>
  dialog {
    padding: 0;
    border: none;
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: var(--shadow);
  }

  dialog::backdrop {
    background: var(--color-scrim);
  }

  .dialog {
    width: min(100% - 2 * var(--space-4), 36rem);
    max-height: min(100% - 2 * var(--space-4), 48rem);
    border-radius: var(--radius-card);
  }

  .dialog[open] {
    animation: fade-in var(--motion-base) ease-out;
  }

  /* Bottom sheet: full width on phones, a docked card on wider screens. */
  .sheet {
    width: 100%;
    max-width: 36rem;
    max-height: calc(100% - var(--space-7));
    margin: auto auto 0;
    border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  }

  .sheet[open] {
    display: flex;
    flex-direction: column;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    dialog[open] {
      animation: none;
    }
  }

  .inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .sheet .inner {
    flex: 1;
    min-height: 0;
    padding-bottom: calc(var(--space-5) + env(safe-area-inset-bottom, 0px));
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  h2 {
    font-size: var(--text-xl);
  }

  .sheet h2 {
    font-size: var(--text-2xl);
  }

  .close-round {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    padding: 0;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
  }

  .close-round:hover {
    border-color: var(--color-accent);
  }

  .close-round path {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .sheet .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-3);
  }

  .sheet .actions {
    flex-direction: column;
    align-items: stretch;
  }
</style>
