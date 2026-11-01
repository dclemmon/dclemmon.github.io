<script lang="ts">
  interface Props {
    checked: boolean;
    /** What is being checked off, for screen readers (e.g. the activity title). */
    describes: string;
    onchange: (checked: boolean) => void;
  }
  let { checked, describes, onchange }: Props = $props();
</script>

<label class="check" class:checked>
  <input type="checkbox" {checked} onchange={(e) => onchange(e.currentTarget.checked)} />
  <span aria-hidden="true">{checked ? 'Done' : 'Mark done'}</span>
  <span class="visually-hidden">Done: {describes}</span>
</label>

<style>
  .check {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--tap-kid);
    padding: var(--space-1) var(--space-5) var(--space-1) var(--space-3);
    border: 2px solid var(--color-accent);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    user-select: none;
  }

  .check.checked {
    border-color: var(--color-done);
    background: var(--color-done-bg);
  }

  .check:has(input:focus-visible) {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  input {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    accent-color: var(--color-done);
    cursor: pointer;
  }

  input:focus-visible {
    outline: none;
  }
</style>
