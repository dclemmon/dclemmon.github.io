# Design notes: direction C "Soft storybook"

Chosen direction for the PoC: soft, warm, kid-friendly, on a lilac paper background. Audience is the Children & Family ministries: parents and kids (roughly preschool through elementary) using the app together, mostly on phones.

## Files

| File | What it is | How to use it |
| --- | --- | --- |
| `wreath.svg` | The wreath, layered and class-driven | Source of truth for the wreath. Inline it in a Svelte component; drive state with classes. |
| `tokens.css` | Colors, type, radii, spacing, motion | Starting point for `src/theme/tokens.css`. |
| `reference/wreath-home.html` | Static mockup of the wreath home screen (Week 2, 2 candles lit) | Visual target. Open in a browser. Not production code. |
| `reference/week-complete.html` | Static mockup of a week sheet with every activity checked | Visual target. Not production code. |

Sample activity text in the references is placeholder only.

## The wreath

- **Layer order is load-bearing:** `#sky` → `#wreath-back` → `#candles` → `#wreath-front`. Candles sit between the two halves of the ring so they look nestled in the greenery. Keep this order in the component.
- **Candles:** `#candle-1` … `#candle-4` and `#candle-christ`, each a `.candle` group with `data-week`. Week 3 is the rose candle; the Christ candle is center.
- **Lighting:** add class `lit` to a `.candle` group to show its glow and flame. Candles light by **calendar date** (current and past weeks lit; Christ candle from Dec 24).
- **Progress:** shown on the week chips and the progress row, not on the wreath. A `complete` class is reserved on `.candle` for an optional subtle effect later.
- **Interaction:** the SVG itself is decorative (`role="img"` with a live label like "Advent wreath, 2 candles lit"). Tappable targets are real buttons: the week chips below the wreath. Optionally, transparent buttons can be overlaid on each candle, each with an accessible name like "Week 2: Peace, 2 of 4 done".
- **Motion:** optional gentle flame flicker and a fade-in when a candle lights. Under `prefers-reduced-motion: reduce`, no animation at all: set `animation: none`, not just shorter durations.

## Screens

### Wreath home (default view)

Top to bottom:
1. Header: "Advent at Home" and the **view switcher**, a two-option segmented control ("Wreath" / "Week list"), text labels, selected option on `--color-accent-soft`.
2. Date range (muted) above the week title ("Week 2 · Peace").
3. Wreath, full content width.
4. Progress row: white card with four dots (filled = done) and "2 of 4 done this week".
5. Week chips: five equal chips (Hope, Peace, Joy, Love, Jesus). Completed: `--color-done-bg` with a check icon. Current: white with a `--color-current` border and "Now". Future: `--color-surface-muted` with its start date. Each is a button that opens that week.
6. Primary button: "See this week's activities" (pill, `--color-accent`).
7. Footer: "Check marks stay on this device." and an "Add reminders" link (the `.ics` feed).

### Week sheet (activity modal)

A bottom sheet (native `<dialog>`) over a scrim:
1. Week title and a round close button (`aria-label="Close"`, 48px).
2. When every activity is checked: a celebration banner (`--color-celebrate-bg`) with a small candle illustration, "You did it!" and "All 4 done. The Hope candle is shining."
3. Activity cards (white, `--radius-card`): a round check button on the left (46px, `aria-pressed`), title, description, optional scripture reference in `--color-accent`.
4. "Next: Week 2 · Peace →" primary button.

### Week list (parent view)

Keep the existing PoC "at a glance" layout as is, restyled with these tokens only.

## Corrections to the mockups

- **Checkbox contrast:** the mockup's check buttons use light green (`#8DBF9B`) with a white check, which fails the 3:1 non-text contrast minimum. Use `--color-done` (`#3F7A52`) for the filled checkbox.
- **Fonts:** the mockups load Baloo 2 from Google Fonts for preview. The app must self-host it (for example via `@fontsource/baloo-2` bundled at build time, or woff2 files in `public/`) so there are no third-party requests.
- **Text scaling:** the mockups use px at a fixed 390px frame. The app uses rem so text follows browser and OS text-size settings, and the layout must reflow at 360px and on desktop.

## Kid-friendly rules

- Tap targets: 44px minimum everywhere; 56px for primary buttons, check boxes and week chips.
- Short, plain words. Every icon has a text label next to it.
- Celebration is gentle and never shames missed weeks or unchecked items.
