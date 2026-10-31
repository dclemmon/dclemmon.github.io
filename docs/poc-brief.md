# PoC brief: placeholder demo

Goal: a simple, working demo with placeholder content, deployable to a personal static host within a few days, so church stakeholders can react to something real. It should also prove out the architecture so later work (calendar view, wreath, final content) slots in without rework.

## In scope

1. **Scaffold** the Vite + TypeScript + Svelte project in the layout described in `docs/requirements.md` (Framework and project structure), with lint, unit tests (Vitest), and `dev` / `test` / `build` / `preview` scripts.
2. **Content file + schema** with placeholder content: 4 Advent weeks (starting Nov 29, Dec 6, Dec 13, Dec 20, 2026) plus Christmas Eve/Day, each with a title, short intro, and 3–4 placeholder activities (title, description, optional scripture reference, optional link). Stable IDs on everything. Build fails on invalid content.
3. **Core logic, unit tested:**
    - `schedule.ts`: which week is current for a given local date; before-season and after-season states; `?date=` override.
    - `storage.ts`: safe `localStorage` wrapper (works when storage throws or is missing).
    - `progress.ts`: toggle/read check-offs by activity ID; reset all.
4. **GuideView:**
    - Opens to the current week (or a "starts Sunday, Nov 29" welcome with a Week 1 preview before the season; a closing page after Dec 25).
    - Previous/next and a direct week list to reach any week.
    - Activity cards with a check box each; a plain "Progress is saved on this device only" note; a "Reset my progress" control.
    - Activity details may open in an `ActivityModal` (native `<dialog>`), to prove the shared component works for the later calendar view.
5. **Theme tokens** with a neutral placeholder palette (the real design isn't chosen yet).
6. **PWA basics:** manifest with placeholder icons, generated service worker (network-first for HTML and content), and a short "Add to Home Screen" tip for iPhone and Android.
7. **`advent.ics`** generated at build time from the content file: one all-day event per week plus Christmas, stable UIDs, a link back to each week. A "Add reminders to my calendar" link in the app (`webcal://` plus download fallback).
8. **Deploy** to GitHub Pages (or Cloudflare Pages) via CI on push to `main`. Configurable `base` path so it also works later at a subdomain root.

## Out of scope for the PoC

- CalendarView, animated doors, wreath graphic, streaks, celebrations (but leave the view-selection config in place).
- Final content, branding, custom domain.
- Analytics of any kind (permanently out of scope for 2026).

## Acceptance checks

- [x] `npm test` passes, including schedule tests for: Nov 28, Nov 29, Dec 5, Dec 6, Dec 24, Dec 25, Dec 26, and a `?date=` override.
- [x] `npm run build` succeeds and fails if the content file is invalid (missing field, duplicate ID).
- [x] Opening the deployed URL lands on the correct week; `?date=2026-12-10` lands on Week 2.
- [ ] Check-offs survive a reload; private browsing works without errors (check-offs just don't persist). _(Reload persistence verified; private browsing covered by unit tests, still to try in a real private window.)_
- [x] Editing an activity's title in the content file does not clear its check-off. _(unit tested)_
- [x] Usable at 360px wide and on a desktop browser; fully operable by keyboard.
- [x] Lighthouse accessibility score ≥ 95; no console errors. _(100 in incognito; no console errors from the app)_
- [ ] With `prefers-reduced-motion: reduce`, no animations play. _(CSS in place; still to verify with the OS setting on.)_
- [x] No network requests to any origin other than the app's own (verify in devtools).
- [ ] `advent.ics` imports cleanly into Apple Calendar and Google Calendar.
- [ ] "Add to Home Screen" works on an iPhone and an Android phone.

## Suggested order

Scaffold → content + schema → core + tests → GuideView → theme → PWA → ics → CI deploy. Open questions for Cameron go at the bottom of this file rather than being guessed.

## Open questions

- **Week 4 is short.** Christmas Eve is a Thursday, so Week 4 runs Dec 20–23 and the "Christmas" section covers Dec 24–25. Is that the intended split, or should Week 4 run through Dec 24?
- **Calendar reminders:** each Advent week gets one all-day event on its Sunday with a 9:00 a.m. alert. Christmas gets a single event covering Dec 24–25. Is that right, or do we want separate Eve and Day events?
- **Scripture:** the placeholder content uses references only, plus one example link to BibleGateway. Which translation does the church prefer, and are outbound links to a Bible site OK?
- **iOS storage note:** the Add-to-Home-Screen tip warns that check-offs don't carry over from Safari to the Home Screen icon. Is that wording clear enough for the audience?
