import { describe, expect, it } from 'vitest';
import { formatMonthDay, formatRange, formatRangeCompact } from './dates.ts';

describe('compact date formats', () => {
  it.each([
    ['2026-12-06', '2026-12-12', 'Dec 6 – 12'],
    ['2026-11-29', '2026-12-05', 'Nov 29 – Dec 5'],
    ['2026-12-24', '2026-12-25', 'Dec 24 – 25'],
    ['2026-12-20', '2026-12-23', 'Dec 20 – 23'],
  ])('formatRangeCompact(%s, %s) → %s', (s, e, out) => {
    expect(formatRangeCompact(s, e)).toBe(out);
  });

  it('formatMonthDay', () => {
    expect(formatMonthDay('2026-12-13')).toBe('Dec 13');
    expect(formatMonthDay('nope')).toBe('nope');
  });

  it('leaves the week list format unchanged', () => {
    expect(formatRange('2026-12-06', '2026-12-12')).toBe('Dec 6 – Dec 12');
  });
});
