<script lang="ts">
  interface Props {
    done: number;
    total: number;
  }
  let { done, total }: Props = $props();
</script>

<p class="progress" role="status">
  <strong>{done} of {total}</strong> done this week{#if total > 0 && done === total}&nbsp;— all
    done!{/if}
</p>

<style>
  .progress {
    color: var(--color-text-muted);
  }

  strong {
    color: var(--color-text);
  }
</style>
