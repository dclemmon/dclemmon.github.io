<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    children: Snippet;
    /** Optional footer actions; a Close button is always present. */
    actions?: Snippet;
    closeLabel?: string;
  }
  let { open, title, onclose, children, actions, closeLabel = 'Close' }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  let returnFocus: HTMLElement | null = null;
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus = document.activeElement as HTMLElement | null;
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
  aria-labelledby={titleId}
  onclose={handleClose}
  onclick={handleBackdropClick}
>
  <div class="inner">
    <h2 id={titleId}>{title}</h2>
    <div class="body">{@render children()}</div>
    <div class="actions">
      {#if actions}{@render actions()}{/if}
      <!-- svelte-ignore a11y_autofocus -->
      <button class="btn" type="button" autofocus onclick={() => dialog?.close()}
        >{closeLabel}</button
      >
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: min(100% - 2 * var(--space-4), 36rem);
    max-height: min(100% - 2 * var(--space-4), 48rem);
    padding: 0;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: var(--shadow);
  }

  dialog::backdrop {
    background: var(--color-scrim);
  }

  dialog[open] {
    animation: fade-in var(--motion-base) ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }

  .inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  h2 {
    font-size: var(--text-xl);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-3);
  }
</style>
