<script lang="ts">
  /** Round check-off button: a 46px circle inside a 56px tap target. */
  interface Props {
    checked: boolean;
    /** What is being checked off (the activity title), for its accessible name. */
    describes: string;
    onchange: (checked: boolean) => void;
  }
  let { checked, describes, onchange }: Props = $props();
</script>

<button
  type="button"
  class="check"
  class:checked
  aria-pressed={checked}
  aria-label="Done: {describes}"
  onclick={() => onchange(!checked)}
>
  <span class="circle" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 12l5 5L20 7" /></svg>
  </span>
</button>

<style>
  .check {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tap-kid);
    height: var(--tap-kid);
    margin: calc(-1 * var(--space-1));
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }

  .circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.875rem; /* 46px */
    height: 2.875rem;
    border: 3px solid var(--color-accent);
    border-radius: 50%;
    background: var(--color-surface);
    transition: background-color var(--motion-fast);
  }

  .checked .circle {
    border-color: var(--color-done);
    background: var(--color-done);
  }

  path {
    fill: none;
    stroke: var(--color-on-accent);
    stroke-width: 3.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
  }

  .checked path {
    opacity: 1;
  }

  .check:hover:not(.checked) .circle {
    background: var(--color-accent-soft);
  }
</style>
