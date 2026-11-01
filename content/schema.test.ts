import { describe, expect, it } from 'vitest';
import seasonData from './advent-2026.json';
import { validateSeason } from './schema.ts';

const clone = () => structuredClone(seasonData) as unknown as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('validateSeason', () => {
  it('accepts the shipped content with no warnings', () => {
    expect(validateSeason(seasonData)).toEqual({ errors: [], warnings: [] });
  });

  it('rejects duplicate ids', () => {
    const d = clone();
    d.weeks[1].activities[0].id = 'w1-light-candle';
    expect(validateSeason(d).errors.join()).toMatch(/duplicate id "w1-light-candle"/);
  });

  it('rejects missing required fields', () => {
    const d = clone();
    delete d.weeks[0].activities[0].title;
    delete d.weeks[2].intro;
    const { errors } = validateSeason(d);
    expect(errors.join()).toMatch(/w1-light-candle.*"title"/);
    expect(errors.join()).toMatch(/week-3.*"intro"/);
  });

  it('rejects dates outside Advent and gaps between sections', () => {
    const d = clone();
    d.weeks[0].startDate = '2026-11-28';
    d.weeks[2].startDate = '2026-12-14';
    const { errors } = validateSeason(d);
    expect(errors.join()).toMatch(/must fall between/);
    expect(errors.join()).toMatch(/gap/);
  });

  it('rejects a section with no activities', () => {
    const d = clone();
    d.weeks[1].activities = [];
    expect(validateSeason(d).errors.join()).toMatch(/week-2.*at least one activity/);
  });

  it('rejects an activity date outside its section', () => {
    const d = clone();
    d.weeks[0].activities[0].date = '2026-12-06';
    expect(validateSeason(d).errors.join()).toMatch(
      /week "week-1", activity #1.*outside week "week-1"/,
    );
  });

  it('rejects unsafe links and bad ids', () => {
    const d = clone();
    d.weeks[0].activities[2].link.href = 'javascript:alert(1)';
    d.weeks[0].activities[1].id = 'Hope Jar';
    const { errors } = validateSeason(d);
    expect(errors.join()).toMatch(/https:\/\/ or a relative path/);
    expect(errors.join()).toMatch(/lowercase/);
  });

  it('warns (not errors) on unknown fields', () => {
    const d = clone();
    d.weeks[0].activities[0].color = 'purple';
    const r = validateSeason(d);
    expect(r.errors).toEqual([]);
    expect(r.warnings.join()).toMatch(/unknown field "color"/);
  });

  it('accepts the optional wreath fields and checks their values', () => {
    const d = clone();
    d.weeks[1].candle = '1'; // already used by week-1
    d.weeks[2].candle = '5';
    d.weeks[3].shortTitle = ' ';
    d.weeks[0].doneMessage = '';
    const { errors } = validateSeason(d);
    expect(errors.join()).toMatch(/week-2.*candle "1" is already used by week "week-1"/);
    expect(errors.join()).toMatch(/week-3.*"candle" must be one of/);
    expect(errors.join()).toMatch(/week-4.*"shortTitle" must be non-empty/);
    expect(errors.join()).toMatch(/week-1.*"doneMessage" must be non-empty/);
  });

  it('warns on a long chip label and a christmas section without the Christ candle', () => {
    const d = clone();
    d.weeks[0].shortTitle = 'Hopefulness';
    delete d.weeks[4].candle;
    const r = validateSeason(d);
    expect(r.errors).toEqual([]);
    expect(r.warnings.join()).toMatch(/week-1.*"shortTitle" is longer than 7/);
    expect(r.warnings.join()).toMatch(/christmas.*"christ" candle/);
  });

  it('allows the wreath fields to be left out', () => {
    const d = clone();
    for (const w of d.weeks) {
      delete w.shortTitle;
      delete w.doneMessage;
      if (w.kind !== 'christmas') delete w.candle;
    }
    expect(validateSeason(d).errors).toEqual([]);
  });
});

/**
 * Saved check-offs are keyed by these IDs. Renaming or removing one silently wipes
 * families' progress, so this list may only grow. Adding new IDs is fine.
 */
describe('stable IDs', () => {
  const WEEK_IDS = ['week-1', 'week-2', 'week-3', 'week-4', 'christmas'];
  const ACTIVITY_IDS = [
    'w1-light-candle',
    'w1-hope-jar',
    'w1-read-together',
    'w2-light-candle',
    'w2-quiet-minute',
    'w2-make-peace',
    'w2-prepare-way',
    'w3-light-candle',
    'w3-sing',
    'w3-joy-gift',
    'w4-light-candle',
    'w4-serve',
    'w4-mary-story',
    'xmas-eve-story',
    'xmas-christ-candle',
    'xmas-birthday',
  ];

  it('keeps every published week ID', () => {
    const ids = seasonData.weeks.map((w) => w.id);
    expect(ids).toEqual(expect.arrayContaining(WEEK_IDS));
  });

  it('keeps every published activity ID', () => {
    const ids = seasonData.weeks.flatMap((w) => w.activities.map((a) => a.id));
    expect(ids).toEqual(expect.arrayContaining(ACTIVITY_IDS));
  });
});
