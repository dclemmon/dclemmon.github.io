import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Guards the color pairs the UI relies on (WCAG 2.2: 4.5:1 text, 3:1 non-text). */
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

function token(name: string): string {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\b`).exec(css);
  if (!m) throw new Error(`No hex value for --${name}`);
  return m[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(token(a)), luminance(token(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT_BACKGROUNDS = [
  'color-bg',
  'color-surface',
  'color-surface-muted',
  'color-done-bg',
  'color-celebrate-bg',
  'color-accent-soft',
];

describe('theme contrast', () => {
  it.each(
    TEXT_BACKGROUNDS.flatMap((bg) => [
      ['color-text', bg],
      ['color-text-muted', bg],
    ]),
  )('%s on %s ≥ 4.5:1', (fg, bg) => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5));

  it.each([
    ['color-accent', 'color-surface'],
    ['color-accent', 'color-bg'],
    ['color-accent', 'color-accent-soft'],
    ['color-on-accent', 'color-accent'],
    ['color-on-accent', 'color-accent-hover'],
  ])('text %s on %s ≥ 4.5:1', (fg, bg) => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5));

  it.each([
    ['color-done', 'color-surface'], // filled check button
    ['color-done', 'color-done-bg'], // check icon on a done chip
    ['color-on-accent', 'color-done'], // white check on the filled button
    ['color-accent', 'color-surface'], // unchecked button ring, focus ring
    ['color-accent', 'color-bg'],
  ])('non-text %s on %s ≥ 3:1', (fg, bg) => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3));
});
