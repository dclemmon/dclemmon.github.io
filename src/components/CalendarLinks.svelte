<script lang="ts">
  const base = import.meta.env.BASE_URL;
  const httpsUrl = new URL(`${base}advent.ics`, window.location.href).href;
  const webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:');
</script>

<details class="panel">
  <summary>Add weekly reminders to my calendar</summary>
  <div class="content">
    <p>Get a reminder each Sunday of Advent, plus Christmas Eve, in your own calendar app.</p>
    <p class="links">
      <a class="btn btn-primary" href={webcalUrl}>Subscribe in my calendar</a>
      <a class="btn" href={httpsUrl} download="advent.ics">Download calendar file</a>
    </p>
    <ul>
      <li><strong>iPhone / Mac:</strong> tap “Subscribe”, then “Subscribe” again to confirm.</li>
      <li>
        <strong>Google Calendar:</strong> on a computer, open Google Calendar → “Other calendars” →
        “+” → “From URL”, and paste: <code>{httpsUrl}</code>
      </li>
      <li>
        <strong>Outlook:</strong> “Add calendar” → “Subscribe from web”, and paste the same link.
      </li>
    </ul>
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

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  ul {
    margin: 0;
    padding-left: var(--space-5);
  }

  li + li {
    margin-top: var(--space-2);
  }

  code {
    word-break: break-all;
    font-size: var(--text-sm);
  }
</style>
