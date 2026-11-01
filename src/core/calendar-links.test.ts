import { describe, expect, it } from 'vitest';
import { feedLinks } from './calendar-links.ts';

describe('feedLinks', () => {
  it('builds https, webcal and Google links at the site root', () => {
    expect(
      feedLinks('rehearsals.ics', '/', 'https://dclemmon.github.io/?date=2026-12-08#x'),
    ).toEqual({
      https: 'https://dclemmon.github.io/rehearsals.ics',
      webcal: 'webcal://dclemmon.github.io/rehearsals.ics',
      google:
        'https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fdclemmon.github.io%2Frehearsals.ics',
    });
  });

  it('respects a sub-path base', () => {
    expect(feedLinks('advent.ics', '/advent/', 'https://example.org/advent/').https).toBe(
      'https://example.org/advent/advent.ics',
    );
  });
});
