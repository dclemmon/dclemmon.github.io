import { describe, expect, it } from 'vitest';
import seasonData from '../content/advent-2026.json';
import { parseSeason } from '../content/schema.ts';
import { buildIcs, escapeText, foldLine } from './ics.ts';

const season = parseSeason(seasonData);
const ics = buildIcs(season, {
  appUrl: 'https://example.org/',
  now: new Date(Date.UTC(2026, 9, 31, 12, 0, 0)),
});

describe('buildIcs', () => {
  it('uses CRLF and wraps a calendar', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/\n/);
  });

  it('has one event per section with stable UIDs', () => {
    const uids = [...ics.matchAll(/^UID:(.+)$/gm)].map((m) => m[1].trim());
    expect(uids).toEqual(season.weeks.map((w) => `${w.id}@advent-follow-along`));
  });

  it('uses all-day dates and links to each week', () => {
    expect(ics).toContain('DTSTART;VALUE=DATE:20261129\r\nDTEND;VALUE=DATE:20261130');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261224\r\nDTEND;VALUE=DATE:20261226');
    expect(ics).toContain('URL:https://example.org/#week-2');
    expect(ics).toContain('DTSTAMP:20261031T120000Z');
  });

  it('keeps every physical line within 75 octets', () => {
    const enc = new TextEncoder();
    for (const line of ics.split('\r\n')) expect(enc.encode(line).length).toBeLessThanOrEqual(75);
  });
});

describe('helpers', () => {
  it('escapes text', () => {
    expect(escapeText('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne');
  });

  it('folds without splitting multibyte characters', () => {
    const folded = foldLine('X:' + '–'.repeat(40));
    for (const part of folded.split('\r\n')) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    }
    expect(folded.replace(/\r\n /g, '')).toBe('X:' + '–'.repeat(40));
  });
});
