import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildAllFeeds } from './ics.ts';
import { loadContentOrExit } from './load-content.ts';
import { appUrl } from './site.ts';

const season = loadContentOrExit();
const dir = new URL('../public/', import.meta.url);
mkdirSync(fileURLToPath(dir), { recursive: true });
const feeds = buildAllFeeds(season, { appUrl: appUrl(), now: new Date() });
for (const [file, text] of Object.entries(feeds)) {
  writeFileSync(fileURLToPath(new URL(file, dir)), text);
}
console.log(`✓ Wrote public/${Object.keys(feeds).join(', public/')} (links to ${appUrl()})`);
