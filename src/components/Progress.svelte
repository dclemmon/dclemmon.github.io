<script lang="ts">
  interface Props {
    done: number;
    total: number;
    /** Text after "N of M", e.g. "done this week". */
    suffix?: string;
  }
  let { done, total, suffix = 'done this week' }: Props = $props();
</script>

<p class="progress" role="status">
  <strong>{done} of {total}</strong>
  {suffix}{#if total > 0 && done === total}&nbsp;— all done!{/if}
</p>

<style>
  .progress {
    color: var(--color-text-muted);
  }

  strong {
    color: var(--color-text);
  }
</style>
