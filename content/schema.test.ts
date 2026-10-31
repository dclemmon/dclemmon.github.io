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
});
