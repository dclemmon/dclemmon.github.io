<script lang="ts">
  // Static tip; no props.
</script>

<details class="panel">
  <summary>Add this page to my Home Screen</summary>
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
</details>

<style>
  .panel summary {
    min-height: var(--tap-min);
    display: flex;
    align-items: center;
    font-weight: 600;
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
