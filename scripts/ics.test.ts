import { describe, expect, it } from 'vitest';
import seasonData from '../content/advent-2026.json';
import { parseSeason } from '../content/schema.ts';
import { buildAllFeeds, buildFeed, buildIcs, escapeText, foldLine } from './ics.ts';
import { formatOffset, offsetMinutes, transitionsInYear, zonedToUtc } from './timezone.ts';

const season = parseSeason(seasonData);
const opts = { appUrl: 'https://example.org/', now: new Date(Date.UTC(2026, 9, 31, 12, 0, 0)) };
const ics = buildIcs(season, opts);
const feeds = buildAllFeeds(season, opts);
const uids = (text: string) => [...text.matchAll(/^UID:(.+)$/gm)].map((m) => m[1].trim());
/** Unfold continuation lines so a property can be matched whole. */
const unfold = (text: string) => text.replace(/\r\n /g, '');
/** The VEVENT block for an event id. */
const vevent = (text: string, id: string) =>
  unfold(text)
    .split('BEGIN:VEVENT')
    .find((b) => b.includes(`UID:${id}@`)) ?? '';

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

describe('calendar feeds', () => {
  const eventIds = (feed: string) =>
    season.events!.filter((e) => e.feed === feed).map((e) => `${e.id}@advent-follow-along`);
  const weekUids = season.weeks.map((w) => `${w.id}@advent-follow-along`);

  it('publishes four files, keeping advent.ics for the weekly reminders', () => {
    expect(Object.keys(feeds).sort()).toEqual([
      'advent.ics',
      'all.ics',
      'events.ics',
      'rehearsals.ics',
    ]);
    expect(feeds['advent.ics']).toBe(ics);
    expect(uids(ics)).toEqual(weekUids);
  });

  it('each feed has the right events; "all" has everything', () => {
    expect(uids(feeds['events.ics'])).toEqual(eventIds('events'));
    expect(uids(feeds['rehearsals.ics'])).toEqual(eventIds('rehearsals'));
    expect(uids(feeds['all.ics']).sort()).toEqual(
      [...weekUids, ...eventIds('events'), ...eventIds('rehearsals')].sort(),
    );
  });

  it('names each calendar from the content file', () => {
    expect(ics).toContain('X-WR-CALNAME:Advent Devotional: Weekly reminders');
    const renamed = structuredClone(season);
    renamed.feeds.find((f) => f.id === 'rehearsals')!.title = 'Pageant practice';
    expect(buildFeed(renamed, 'rehearsals', opts)).toContain(
      'X-WR-CALNAME:Advent Devotional: Pageant practice',
    );
  });

  it('writes times in the church time zone, with a matching VTIMEZONE', () => {
    const text = unfold(feeds['events.ics']);
    expect(text).toContain('BEGIN:VTIMEZONE\r\nTZID:America/Denver');
    expect(text).toContain('DTSTART:20261101T020000\r\nTZOFFSETFROM:-0600\r\nTZOFFSETTO:-0700');
    const pageant = vevent(feeds['events.ics'], 'childrens-pageant');
    expect(pageant).toContain('DTSTART;TZID=America/Denver:20261220T100000');
    expect(pageant).toContain('DTEND;TZID=America/Denver:20261220T110000');
    expect(pageant).toContain('LOCATION:Sanctuary');
  });

  it('the reminders feed needs no time zone', () => {
    expect(ics).not.toContain('VTIMEZONE');
  });

  it('turns a weekly event into one repeating event with skipped dates', () => {
    const r = vevent(feeds['rehearsals.ics'], 'pageant-rehearsal');
    // 23:59:59 on Dec 16 in Denver (UTC-7) is 06:59:59 UTC on Dec 17.
    expect(r).toContain('RRULE:FREQ=WEEKLY;UNTIL=20261217T065959Z');
    expect(r).toContain('EXDATE;TZID=America/Denver:20261125T180000');
  });

  it('marks cancelled events instead of dropping them', () => {
    const c = vevent(feeds['events.ics'], 'cookie-decorating');
    expect(c).toContain('STATUS:CANCELLED');
    expect(c).toContain('SUMMARY:Cancelled: Cookie decorating');
  });

  it('handles all-day events', () => {
    const s = structuredClone(season);
    const e = s.events!.find((x) => x.id === 'advent-family-night')!;
    delete e.start;
    delete e.end;
    const v = vevent(buildFeed(s, 'events', opts), 'advent-family-night');
    expect(v).toContain('DTSTART;VALUE=DATE:20261129');
    expect(v).toContain('DTEND;VALUE=DATE:20261130');
  });

  it('keeps every feed within 75 octets per line, with CRLF endings', () => {
    const enc = new TextEncoder();
    for (const text of Object.values(feeds)) {
      expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true);
      for (const line of text.split('\r\n'))
        expect(enc.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('event IDs never collide with week IDs', () => {
    const all = uids(feeds['all.ics']);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('time zone helpers', () => {
  it('knows Denver offsets in winter and summer', () => {
    expect(offsetMinutes(Date.UTC(2026, 11, 1), 'America/Denver')).toBe(-420);
    expect(offsetMinutes(Date.UTC(2026, 6, 1), 'America/Denver')).toBe(-360);
    expect(formatOffset(-420)).toBe('-0700');
    expect(formatOffset(330)).toBe('+0530');
  });

  it('converts local wall-clock time to UTC', () => {
    expect(zonedToUtc('2026-12-16', '23:59:59', 'America/Denver').toISOString()).toBe(
      '2026-12-17T06:59:59.000Z',
    );
    expect(zonedToUtc('2026-07-04', '12:00', 'America/Denver').toISOString()).toBe(
      '2026-07-04T18:00:00.000Z',
    );
  });

  it('finds the daylight-saving changes in a year', () => {
    expect(transitionsInYear(2026, 'America/Denver')).toEqual([
      { localStart: '20260308T020000', fromMinutes: -420, toMinutes: -360 },
      { localStart: '20261101T020000', fromMinutes: -360, toMinutes: -420 },
    ]);
    expect(transitionsInYear(2026, 'America/Phoenix')).toEqual([]);
  });
});
