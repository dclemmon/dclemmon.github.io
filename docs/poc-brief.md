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
5. **Week sheet:** a bottom sheet on native `<dialog>` with round check buttons, a celebration when the week is done, and a "Next" button. Android Back closes it. Since the devotion-first pass, the sheet opens with the week's introduction, shows one compact row per activity (round check button plus title), and tapping a title shows that activity on its own inside the same sheet, with a "Mark done" control and a link back to the week. Church events follow the activities.
6. **View switcher:** "Wreath" / "Week list" on both views, saved on the device, with `?view=wreath|list` for links and QA.
7. **Week list:** the iteration 1 layout, restyled only.
8. **Motion:** flame flicker, candle light-up, sheet slide-up and celebration, all off under reduced motion.
9. **Icons:** redrawn in the new palette.

### Acceptance checks

Status after the step 13 pass (Oct 31). _Checked in headless Chrome_ means automated checks at an emulated 360px / 390px phone and 1280px desktop; items marked **device** still need a real phone or a person.

- [x] `npm test` passes, including new tests for lit candles, week timing and status, the view preference, compact date formats, the new schema fields and the stable-ID guard. _(106 tests)_
- [x] `npm run build` passes, and fails on an invalid or duplicate `candle`. _(validation stops with "candle "1" is already used by week "week-1"")_
- [x] With nothing saved, the app opens to the Wreath view. `?view=list` shows the Week list without changing the saved choice. The switcher's choice survives a reload. _(headless Chrome)_
- [x] `?date=2026-12-08` shows "Dec 6 – 12", "Week 2 · Peace", 2 candles lit, Hope done (if checked), Peace "Now", and Joy, Love and Jesus with their dates.
- [x] Dec 24 lights the Christ candle. Nov 28 lights nothing. Dec 26 lights all five. _(unit tests and screenshots)_
- [ ] Chips and "See this week's activities" open the week sheet. Escape and the close button close it, and focus returns to the opener. _(Opening, the close button and focus return checked in headless Chrome; **device/keyboard:** press Escape, and Tab through the open sheet.)_
- [x] Checking every activity shows "You did it!" and a screen reader announces it. "Next" moves to the following week. _(The banner is in a `role="status"` region; hearing it with VoiceOver/TalkBack is listed below.)_
- [x] Check-offs made in iteration 1 still show as done. _(unit tested; IDs and storage key unchanged)_
- [x] The wreath home and week sheet match `docs/design/reference/*.html`, apart from the corrections in the design notes. _(Side by side at 390px. Known differences: darker check fill, "✓ Done" on chips, 44px switcher buttons that wrap under the longer app name at phone widths, 56px check tap area.)_
- [x] The Week list behaves exactly as in iteration 1, restyled. _(week nav, focus on the week heading, check-offs, progress, More dialog and focus return)_
- [x] No hex colors outside `tokens.css`, apart from the commented manifest values. _(plus the matching `theme-color` meta tag and the icon SVG, both commented)_
- [x] Baloo 2 is served from the app's own origin; no third-party requests. _(only the app's own host requested)_
- [x] With reduced motion on, nothing animates. _(emulated `prefers-reduced-motion: reduce`: no running animations on the home screen, sheet or celebration; **device:** confirm with the iOS/macOS setting.)_
- [x] Primary buttons, check buttons and week chips are at least 56px; everything else tappable is at least 44px. Every icon has visible text. _(every button, link and summary measured on both views and the sheet)_
- [x] Usable at 360px and on desktop, with no horizontal scroll at 200% text.
- [ ] Lighthouse accessibility ≥ 95 on both views; no console errors; first load < 500 KB. _(No console errors or warnings; first load is about 70 KB compressed including the font. **Lighthouse** still to run in Chrome DevTools.)_
- [x] The app shows as "Advent Devotional" (header, tab title, install name). Calendar subscribers see renamed events, not duplicates. _(event UIDs unchanged; the calendar is named "Advent Devotional")_
- [ ] Android Back closes an open week sheet without leaving the app. _(Logic checked in headless Chrome with history.back(); **device:** Android Chrome and the installed app.)_
- [ ] New icons look right on iPhone and Android Home Screens, including the maskable crop. _(**device**)_
- [ ] Add to Home Screen works on an iPhone and an Android phone. Private browsing works without errors. _(**device**; storage failure paths are unit tested.)_

### Still to check by hand

1. **Keyboard (desktop):** Tab from the switcher through the chips to the main button; Enter opens the sheet; Tab stays inside it; Space toggles a check; Escape closes it and focus lands on the chip.
2. **Screen reader:** VoiceOver (iPhone and Mac) and TalkBack if available. The wreath reads "Advent wreath, N candles lit"; chips read their state; check buttons say pressed or not pressed; finishing a week announces "You did it!"; the switcher says which view is selected.
3. **Reduced motion:** turn on Reduce Motion on an iPhone or Mac and confirm the candles, sheet and celebration don't move.
4. **Lighthouse:** accessibility on both views (`?view=wreath` and `?view=list`) in an incognito window.
5. **iPhone and Android:** Add to Home Screen; check the icon, the lilac theme colour, that it opens to the wreath, that check-offs persist, and that the sheet clears the iPhone home bar.
6. **Android Back:** with an activity open, Back returns to its week; with a week open, Back closes the sheet; one more Back leaves as normal. Try in Chrome and in the installed app.
7. **Private browsing and Gmail's in-app browser:** no errors, check-offs work for the visit, and the view falls back to the Wreath after a reload.
8. **Candle light-up:** watch the candles fade in on a real phone (about 1.2 seconds in all).

## Iteration 3: church events and calendar feeds

Families can see and subscribe to services, special events and rehearsals alongside the weekly reminders. Real events aren't known yet, so the content file starts with placeholder events marked as samples.

### In scope

1. **Content:** a season `timeZone` (`America/Denver`); a `feeds` list with each feed's name and description (editable text); an `events` list with stable IDs, feed, title, date, optional start/end time, place, description, weekly repeat with skipped dates, and a cancelled flag. Validation for all of it. Existing IDs unchanged.
2. **Core (unit tested):** expanding repeating events, upcoming events, events in a week, and time formatting.
3. **Feeds:** `advent.ics` (weekly reminders, same file name), `events.ics`, `rehearsals.ics`, `all.ics`. Timed events use the Denver time zone; repeats and skips become one repeating event; IDs never change.
4. **Calendar dialog:** "Reminders and events" (opened from "Get reminders and events") with a card per feed: Subscribe, Add to Google Calendar (every device) and Download, plus the per-phone steps. The List view's calendar panel shows the same cards.
5. **Events in the app:** "Coming up" on the Wreath view with "See all events"; "This week at church" in the week sheet; each week's events in the List view. Every event is shown to everyone, labeled by type.

### Acceptance checks

Status after the step 7 pass (Oct 31). **Device** items need the feeds on the live site and a real phone.

- [x] `npm test` passes, including tests for event validation, repeat expansion, upcoming events, events per week, time formatting and every feed. _(151 tests)_
- [x] `npm run build` fails on a duplicate event ID, an unknown feed, a bad date or time, or an end before the start.
- [x] `advent.ics` still has the same event IDs; existing subscribers see no duplicates. _(compared with the live file; only the calendar name changes, to "Advent Devotional: Weekly reminders")_
- [ ] Each of `events.ics`, `rehearsals.ics` and `all.ics` imports cleanly into Apple Calendar and Google Calendar, with times correct in Denver time and in another time zone. _(**device**; format, time zone block and UTC repeat end are unit tested)_
- [x] A weekly rehearsal shows on every week except its skipped dates; a cancelled event shows as cancelled. _(in the app and in the feed; **device:** confirm in a calendar app)_
- [x] Renaming a feed in the content file changes its name in the app and in the calendar. _(unit tested for the feed; the cards read names from content)_
- [ ] Each feed card's Subscribe, Add to Google Calendar and Download work on an iPhone and an Android phone. _(**device**; Google can only fetch the feed from the live site)_
- [x] "Coming up" shows the next events for the current date (try several `?date=` values); "See all events" lists them all; the week sheet and List view show each week's events. _(checked Nov 20, Dec 8, Dec 21 and Dec 26)_
- [x] Targets, contrast, keyboard, screen reader, reduced motion and 360px checks still pass. _(sizes, overflow at 200% text and reduced motion re-measured; keyboard and screen reader by hand as before)_

### Try on a phone

1. On https://dclemmon.github.io/, open **Get reminders and events** and tap **Subscribe** on "Rehearsals" (iPhone) or **Add to Google Calendar** (Android, or any phone using Google Calendar).
2. Check the pageant rehearsal shows Wednesdays 6–7 pm from Nov 18 to Dec 16, with no rehearsal on Nov 25.
3. Subscribe to "Services and special events": the Dec 12 cookie decorating should show as cancelled, the Dec 20 pageant at 10–11 am.
4. Optional: change the phone's time zone and confirm the times shift (e.g. the pageant shows 12–1 pm in Eastern time).

### Open items

- "Bring something" or "wear something" notes on events (revisit later).
- Real event dates, times and places from the ministry.

## Suggested order

Scaffold → content + schema → core + tests → GuideView → theme → PWA → ics → CI deploy. Open questions for Cameron go at the bottom of this file rather than being guessed.

## Open questions

- **Week 4 is short.** Christmas Eve is a Thursday, so Week 4 runs Dec 20–23 and the "Christmas" section covers Dec 24–25. Is that the intended split, or should Week 4 run through Dec 24?
- **Calendar reminders:** each Advent week gets one all-day event on its Sunday with a 9:00 a.m. alert. Christmas gets a single event covering Dec 24–25. Is that right, or do we want separate Eve and Day events?
- **Scripture:** the placeholder content uses references only, plus one example link to BibleGateway. Which translation does the church prefer, and are outbound links to a Bible site OK?
- **iOS storage note:** the Add-to-Home-Screen tip warns that check-offs don't carry over from Safari to the Home Screen icon. Is that wording clear enough for the audience?
