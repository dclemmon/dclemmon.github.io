<script lang="ts">
  import { onMount } from 'svelte';
  import { config, season } from './config.ts';
  import SiteHeader from './components/SiteHeader.svelte';
  import ViewSwitcher from './components/ViewSwitcher.svelte';
  import { resolveView, saveView } from './core/preferences.ts';
  import { createProgress } from './core/progress.ts';
  import { getDateOverride, getSeasonState, getToday, weekIdFromHash } from './core/schedule.ts';
  import { createStorage } from './core/storage.ts';
  import { reactiveProgress } from './lib/progress.svelte.ts';
  import { viewNames, views, type ViewName } from './views/index.ts';

  const search = window.location.search;
  const seasonState = getSeasonState(season, getToday(search));
  const previewDate = getDateOverride(search);
  const storage = createStorage();
  const progress = reactiveProgress(createProgress(storage));
  // ?view= wins for this visit but is never saved; the switcher's choice is saved.
  let viewName: ViewName = $state(resolveView(search, storage, viewNames, config.defaultView));
  const viewOptions = viewNames.map((name) => ({ name, label: views[name].label }));

  function selectView(name: string) {
    const next = viewNames.find((n) => n === name);
    if (!next) return;
    viewName = next;
    saveView(storage, next);
    // Drop a ?view= override so a reload shows what was just chosen.
    const params = [...new URLSearchParams(window.location.search)];
    if (params.some(([key]) => key === 'view')) {
      const query = new URLSearchParams(params.filter(([key]) => key !== 'view')).toString();
      history.replaceState(
        history.state,
        '',
        window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
      );
    }
  }

  // A #week-id in the URL (e.g. from a calendar reminder) picks the starting week.
  const initialHashWeek = weekIdFromHash(season, window.location.hash);
  let selectedWeekId = $state(initialHashWeek ?? seasonState.currentWeekId);
  let linkedWeek: { id: string } | undefined = $state(
    initialHashWeek ? { id: initialHashWeek } : undefined,
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
      if (id) {
        selectedWeekId = id;
        linkedWeek = { id };
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });

  const View = $derived(views[viewName].component);
</script>

<SiteHeader title={season.title} notice={season.notice} {previewDate}>
  {#snippet controls()}
    <ViewSwitcher options={viewOptions} selected={viewName} onSelect={selectView} />
  {/snippet}
</SiteHeader>

<View
  {season}
  {seasonState}
  {previewDate}
  {selectedWeekId}
  onSelectWeek={selectWeek}
  {linkedWeek}
  {progress}
/>
