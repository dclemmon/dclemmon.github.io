<script lang="ts">
  import type { Activity } from '../../content/schema.ts';
  import { formatLongDate } from '../core/dates.ts';
  import Checkbox from './Checkbox.svelte';
  import Modal from './Modal.svelte';

  interface Props {
    activity: Activity | null;
    done: boolean;
    onToggle: (done: boolean) => void;
    onclose: () => void;
  }
  let { activity, done, onToggle, onclose }: Props = $props();
</script>

{#if activity}
  <Modal open={activity !== null} title={activity.title} {onclose}>
    {#if activity.date}<p class="meta">{formatLongDate(activity.date)}</p>{/if}
    {#if activity.image}
      <img src={activity.image.src} alt={activity.image.alt} loading="lazy" />
    {/if}
    <p>{activity.description}</p>
    {#if activity.details}<p>{activity.details}</p>{/if}
    {#if activity.scripture}<p class="meta">Scripture: {activity.scripture}</p>{/if}
    {#if activity.link}
      <p>
        <a href={activity.link.href} target="_blank" rel="noopener noreferrer"
          >{activity.link.label}<span class="visually-hidden"> (opens in a new tab)</span></a
        >
      </p>
    {/if}
    <div><Checkbox checked={done} describes={activity.title} onchange={onToggle} /></div>
  </Modal>
{/if}

<style>
  .meta {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-sm);
  }
</style>
