import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateSeason, type Season } from '../content/schema.ts';

export const CONTENT_PATH = fileURLToPath(new URL('../content/advent-2026.json', import.meta.url));

/** Read and validate the content file; prints problems and exits non-zero if invalid. */
export function loadContentOrExit(path = CONTENT_PATH): Season {
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`✗ Could not read ${path} as JSON:\n  ${(err as Error).message}`);
    process.exit(1);
  }
  const { errors, warnings } = validateSeason(data);
  for (const w of warnings) console.warn(`⚠ ${w}`);
  if (errors.length > 0) {
    console.error(`✗ Content has ${errors.length} problem(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  return data as Season;
}
