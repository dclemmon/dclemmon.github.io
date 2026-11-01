import { CONTENT_PATH, loadContentOrExit } from './load-content.ts';

const path = process.argv[2] ?? CONTENT_PATH;
const season = loadContentOrExit(path);
const count = season.weeks.reduce((n, w) => n + w.activities.length, 0);
console.log(
  `✓ Content OK: ${season.weeks.length} sections, ${count} activities, ${season.events?.length ?? 0} events`,
);
