<script lang="ts">
  /** "Add to my calendar": one card per feed, each with Subscribe, Google and Download. */
  import { FEED_FILES, type Feed } from '../../content/schema.ts';
  import { feedLinks } from '../core/calendar-links.ts';

  interface Props {
    /** The feeds to offer, in display order (names and descriptions come from content). */
    feeds: Feed[];
    /** Show the cards directly (e.g. inside a dialog) instead of in a collapsible panel. */
    inline?: boolean;
  }
  let { feeds, inline = false }: Props = $props();

  const base = import.meta.env.BASE_URL;
  const cards = $derived(
    feeds.map((feed) => ({
      feed,
      file: FEED_FILES[feed.id],
      links: feedLinks(FEED_FILES[feed.id], base, window.location.href),
    })),
  );
</script>

{#snippet content()}
  <div class="content">
    <p>
      Pick a calendar to add to your phone or computer. It updates on its own when plans change.
    </p>
    <ul class="cards">
      {#each cards as { feed, file, links } (feed.id)}
        <li class="card">
          <h3>{feed.title}</h3>
          <p class="desc">{feed.description}</p>
          <div class="buttons">
            <a class="btn btn-primary" href={links.webcal}
              >Subscribe<span class="visually-hidden">: {feed.title}</span></a
            >
            <a class="btn" href={links.google} target="_blank" rel="noopener noreferrer"
              >Add to Google Calendar<span class="visually-hidden"
                >: {feed.title} (opens Google Calendar)</span
              ></a
            >
          </div>
          <a class="download" href={links.https} download={file}
            >Download calendar file<span class="visually-hidden">: {feed.title}</span></a
          >
        </li>
      {/each}
    </ul>
    <h3 class="how">How to add it</h3>
    <ul class="steps">
      <li><strong>iPhone or Mac:</strong> tap “Subscribe”, then “Subscribe” again to confirm.</li>
      <li>
        <strong>Android or Google Calendar:</strong> tap “Add to Google Calendar”, sign in if asked, then
        tap “Add”. Google can take up to a day to show changes.
      </li>
      <li>
        <strong>Outlook:</strong> “Add calendar” → “Subscribe from web”, then paste the address of the
        “Download calendar file” link (press and hold or right-click it to copy).
      </li>
    </ul>
  </div>
{/snippet}

{#if inline}
  {@render content()}
{:else}
  <details class="panel">
    <summary>Add to my calendar</summary>
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

  .cards {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border-radius: var(--radius-card);
    background: var(--color-surface);
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-tight);
  }

  .desc {
    color: var(--color-text-muted);
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .buttons .btn {
    flex: 1 1 auto;
  }

  .download {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    min-height: var(--tap-min);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
  }

  .how {
    margin-top: var(--space-2);
  }

  .steps {
    margin: 0;
    padding-left: var(--space-5);
  }

  .steps li + li {
    margin-top: var(--space-2);
  }
</style>
