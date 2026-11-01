# PoC brief: placeholder demo

_Iteration 1 (below, through "Out of scope") is done; iteration 2 follows its acceptance checks._

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

## Iteration 2: "Soft storybook" and the Advent wreath

The audience is now the Children & Family ministries: parents and kids (preschool through elementary) using the app together, mostly on phones. The visual direction is chosen (direction C, `docs/design/`), and the app is named "Advent Devotional".

### In scope

1. **Theme:** `docs/design/tokens.css` becomes `src/theme/tokens.css`; components use tokens only. Baloo 2 is self-hosted (no third-party requests). Light theme only for now.
2. **Content:** optional week fields `shortTitle` (chip label), `candle` (`"1"`–`"4"`, `"christ"`) and `doneMessage` (celebration text). All existing IDs stay the same, so saved check-offs survive.
3. **Core (unit tested):** which candles are lit for a date, each week's timing (past / current / future) and completion counts, and the saved view choice.
4. **WreathView (new default):** date and week title, the wreath (candles lit by date), a progress row, five week chips, "See this week's activities", and a footer with the device-only note, "Add reminders" and "Add to Home Screen".
5. **Week sheet:** a bottom sheet on native `<dialog>` with round check buttons, a celebration when the week is done, and a "Next" button. Android Back closes it.
6. **View switcher:** "Wreath" / "Week list" on both views, saved on the device, with `?view=wreath|list` for links and QA.
7. **Week list:** the iteration 1 layout, restyled only.
8. **Motion:** flame flicker, candle light-up, sheet slide-up and celebration, all off under reduced motion.
9. **Icons:** redrawn in the new palette.

### Acceptance checks

- [ ] `npm test` passes, including new tests for lit candles, week timing and status, the view preference, compact date formats, the new schema fields and the stable-ID guard.
- [ ] `npm run build` passes, and fails on an invalid or duplicate `candle`.
- [ ] With nothing saved, the app opens to the Wreath view. `?view=list` shows the Week list without changing the saved choice. The switcher's choice survives a reload.
- [ ] `?date=2026-12-08` shows "Dec 6 – 12", "Week 2 · Peace", 2 candles lit, Hope done (if checked), Peace "Now", and Joy, Love and Jesus with their dates.
- [ ] Dec 24 lights the Christ candle. Nov 28 lights nothing. Dec 26 lights all five.
- [ ] Chips and "See this week's activities" open the week sheet. Escape and the close button close it, and focus returns to the opener.
- [ ] Checking every activity shows "You did it!" and a screen reader announces it. "Next" moves to the following week.
- [ ] Check-offs made in iteration 1 still show as done.
- [ ] The wreath home and week sheet match `docs/design/reference/*.html`, apart from the corrections in the design notes.
- [ ] The Week list behaves exactly as in iteration 1, restyled.
- [ ] No hex colors outside `tokens.css`, apart from the commented manifest values.
- [ ] Baloo 2 is served from the app's own origin; no third-party requests.
- [ ] With reduced motion on, nothing animates.
- [ ] Primary buttons, check buttons and week chips are at least 56px; everything else tappable is at least 44px. Every icon has visible text.
- [ ] Usable at 360px and on desktop, with no horizontal scroll at 200% text.
- [ ] Lighthouse accessibility ≥ 95 on both views; no console errors; first load < 500 KB.
- [ ] The app shows as "Advent Devotional" (header, tab title, install name). Calendar subscribers see renamed events, not duplicates.
- [ ] Android Back closes an open week sheet without leaving the app.
- [ ] New icons look right on iPhone and Android Home Screens, including the maskable crop.
- [ ] Add to Home Screen works on an iPhone and an Android phone. Private browsing works without errors.

## Suggested order

Scaffold → content + schema → core + tests → GuideView → theme → PWA → ics → CI deploy. Open questions for Cameron go at the bottom of this file rather than being guessed.

## Open questions

- **Week 4 is short.** Christmas Eve is a Thursday, so Week 4 runs Dec 20–23 and the "Christmas" section covers Dec 24–25. Is that the intended split, or should Week 4 run through Dec 24?
- **Calendar reminders:** each Advent week gets one all-day event on its Sunday with a 9:00 a.m. alert. Christmas gets a single event covering Dec 24–25. Is that right, or do we want separate Eve and Day events?
- **Scripture:** the placeholder content uses references only, plus one example link to BibleGateway. Which translation does the church prefer, and are outbound links to a Bible site OK?
- **iOS storage note:** the Add-to-Home-Screen tip warns that check-offs don't carry over from Safari to the Home Screen icon. Is that wording clear enough for the audience?
