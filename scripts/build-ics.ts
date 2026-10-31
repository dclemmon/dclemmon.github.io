import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildIcs } from './ics.ts';
import { loadContentOrExit } from './load-content.ts';
import { appUrl } from './site.ts';

const season = loadContentOrExit();
const out = fileURLToPath(new URL('../public/advent.ics', import.meta.url));
mkdirSync(fileURLToPath(new URL('../public/', import.meta.url)), { recursive: true });
writeFileSync(out, buildIcs(season, { appUrl: appUrl(), now: new Date() }));
console.log(`✓ Wrote public/advent.ics (links to ${appUrl()})`);
