<script lang="ts">
  import { onMount } from 'svelte';
  import { config, season } from './config.ts';
  import { createProgress } from './core/progress.ts';
  import { getDateOverride, getSeasonState, getToday, weekIdFromHash } from './core/schedule.ts';
  import { createStorage } from './core/storage.ts';
  import { reactiveProgress } from './lib/progress.svelte.ts';
  import { views } from './views/index.ts';

  const search = window.location.search;
  const seasonState = getSeasonState(season, getToday(search));
  const previewDate = getDateOverride(search);
  const progress = reactiveProgress(createProgress(createStorage()));

  // A #week-id in the URL (e.g. from a calendar reminder) picks the starting week.
  let selectedWeekId = $state(
    weekIdFromHash(season, window.location.hash) ?? seasonState.currentWeekId,
  );

  function selectWeek(id: string) {
    selectedWeekId = id;
    // Drop any stale #week hash so a later reload opens to the current week.
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  onMount(() => {
    const onHash = () => {
      const id = weekIdFromHash(season, window.location.hash);
      if (id) selectedWeekId = id;
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });

  const View = views[config.view];
</script>

<View {season} {seasonState} {previewDate} {selectedWeekId} onSelectWeek={selectWeek} {progress} />
