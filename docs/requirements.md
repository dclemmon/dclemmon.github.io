# Advent Follow-Along — Requirements

Oct 31, 2026 · Cameron

## Overview

A static, backend-free web app (PWA), "Advent Devotional", lets families in the church's Children & Family ministries follow the 2026 Advent at-home activities. Parents and their kids (roughly preschool through elementary) use it together, mostly on a phone; tablets and computers work too. Families reach it by scanning a QR code on a laser-cut ornament, or from a link in email or the bulletin. Advent 2026 runs Sunday, November 29 through Friday, December 25.

### Goals

- Show each week's preset activities, opening to the current week automatically.
- Let families browse all weeks and optionally check off what they've done, stored only on their device.
- Run entirely as static files: no server code, no APIs, no accounts, no database.
- Use a church-owned URL that can be reused in future years.
- Let a non-developer fix typos and small content bugs without touching code.

### Non-goals

- Native iOS or Android apps, or app store listings.
- Accounts, sign-in, or any participation tracking or reporting.
- Analytics in 2026 (may be considered in a later year).
- Push notifications that need a server.
- Printed materials (produced separately by other means).

## Users and access paths

The audience is the Children & Family ministries: parents and their kids, roughly preschool through elementary, using the app together. Phones come first; desktop stays usable but is secondary.

| User | Typical device | How they arrive |
| --- | --- | --- |
| Parent and kids together (primary) | Phone, sometimes tablet | Scanning the ornament QR code; often add to Home Screen |
| Parent alone (planning the week) | Phone | Ministry email, bulletin link or QR code |
| Grandparent or other caregiver | Tablet or desktop | Link forwarded by the family or on the church website |

- Kids may hold the phone, but a parent is assumed to be nearby; young children may not read yet, so short words, pictures and clear states matter more than long text.

- Every path lands on the same URL; no path may require installing anything.
- Links opened inside email apps (Gmail, Outlook) or social apps may use an in-app browser; the app must work there, accepting that check-offs won't carry over to the regular browser.

## Functional requirements

Must-haves are marked **M**; nice-to-haves **N**.

### Schedule and navigation

1. **M** Content is organized by week: Week 1 (Nov 29), Week 2 (Dec 6), Week 3 (Dec 13), Week 4 (Dec 20), plus Christmas Eve/Day (Dec 24–25).
2. **M** On load, the app opens to the current week, based on the device's local date. Weeks begin on Sunday.
3. **M** Users can move to any other week (previous/next and a direct week list), including future weeks. All gating is client-side and advisory.
4. **M** Before Nov 29, show a welcome/"starts Sunday" page with a way to preview Week 1. After Dec 25, show a closing page with access to all weeks.
5. **N** A test override (for example `?date=2026-12-10`) to preview any date during demos and QA.
6. **N** Optional per-day items within a week, if the content team wants daily prompts.

### Activities

1. **M** Each week shows a title, short intro, and a list of activities. Each activity has a title, description, and optional scripture reference, image, and link.
2. **M** Content renders legibly on a 360 px-wide phone and a desktop browser.

### Check-offs (local only)

1. **M** Each activity has a check box to mark it done.
2. **M** Check-off state is stored only in the browser's `localStorage`; nothing is ever sent off the device.
3. **M** The app tells users plainly that progress is saved on this device only.
4. **M** A "reset my progress" control clears local state.
5. **M** The app works fully if storage is unavailable or cleared (private browsing, iOS purges); check-offs just don't persist.
6. **M** State is keyed by a content ID per activity, so fixing a typo doesn't wipe anyone's check-offs.

### Gamification

1. **N** Streaks: count consecutive weeks (or days, if daily items exist) with at least one activity completed.
2. **M** An animated Advent wreath (the default view). Candles light by calendar date (current and past weeks; the Christ candle from Dec 24). Per-week progress shows on week chips and a progress row, not on the wreath.
3. **M** A gentle celebration when every activity in a week is checked.
4. **N** Any gamification is computed purely from local state, never compares users, and never shames missed weeks.

## Content and editing

Content lives in a data file separate from the code, so typo and bug fixes never touch application logic.

1. **M** All activity text lives in one content file (JSON or YAML; final choice in design), with stable IDs per week and activity.
2. **M** A typo fix is a one-file text edit, then a redeploy, with no build tools required on the editor's machine. A build step that bundles the content in is acceptable if the host runs it automatically on commit.
3. **M** The same content file generates the `.ics` calendar feed, so dates never drift between the app and the calendar.
4. **M** A short "how to fix a typo" note for whoever maintains it besides Cameron.
5. **M** All content (activity text, scripture, images) must be cleared for use. Song lyrics and hymn text need appropriate licensing (for example the church's CCLI coverage); Bible quotations should follow the translation's permissions.
6. **N** A content validation check (missing fields, duplicate IDs, dates outside Advent) that runs before deploy.

## Reminders and events: calendar feeds

Reminders and church events come from static `.ics` calendar feeds that users subscribe to, letting their own calendar app notify them with no server involved.

1. **M** Publish a static `advent.ics` alongside the app, generated from the content file.
2. **M** One event per week (all-day on each Advent Sunday), plus Christmas Eve/Day. Each event has a short summary and a link back to that week in the app.
3. **M** The app offers "Add reminders to my calendar" with a subscribe link (`webcal://`) plus a plain download fallback, and brief instructions for iPhone, Android/Google Calendar and Outlook.
4. **M** Events use stable UIDs so content updates change existing events instead of duplicating them for subscribers.
5. **N** Default alarm (`VALARM`) on each event, such as 9:00 a.m. the day of. Some calendar apps ignore feed alarms, so this is best-effort.
6. **N** Optional mid-week nudge events if the content team wants more than one reminder per week.
7. Email or text reminders through the church's existing communication channels remain the primary reminder path for members who won't subscribe.

### Services, special events and rehearsals

8. **M** Church events (services, special events, rehearsals) live in the same content file as the activities, each with a stable ID, title, date, optional start and end time, place and short description. Weekly rehearsals can repeat, with skipped dates. An event can be marked cancelled instead of deleted, so subscribed calendars show the change.
9. **M** Times are in the church's time zone (`America/Denver`), stored once in the content file.
10. **M** Separate feeds, each generated from the content file: weekly reminders (`advent.ics`, unchanged so existing subscribers keep it), services and special events (`events.ics`), rehearsals (`rehearsals.ics`), and everything combined (`all.ics`).
11. **M** Feed names and descriptions live in the content file, so they can be renamed without touching code. Starting names: "Weekly reminders", "Services and special events", "Rehearsals", "Everything".
12. **M** The calendar dialog shows one card per feed, each with Subscribe (`webcal://`), "Add to Google Calendar" (shown on every device, since `webcal://` often does nothing on Android) and a download fallback, plus the per-phone steps.
13. **M** Events also show in the app: a "Coming up" list on the Wreath view with a full list one tap away, "This week at church" in the week sheet, and each week's events in the List view. All events show to everyone, labeled by type.
14. **N** Later: an optional "bring something" or "wear something" note per event.

Note: Google Calendar refreshes subscribed feeds slowly (often many hours, sometimes a day), so same-day changes still need an email or text. Apple Calendar refreshes more often.

## Ornament, QR code and URL

The QR code encodes a short, church-owned URL that never changes, so the hosting behind it can move freely.

### URL

1. **M** A church-owned subdomain, such as `advent.<church-domain>`, registered with church IT and reusable every year.
2. **M** The QR code encodes only that root URL (HTTPS, no query strings, no tracking parameters).
3. **M** No third-party "dynamic QR" or URL-shortener service.
4. **M** The URL must keep resolving after this season, to an archive page or next year's content, since ornaments will be kept.
5. **M** The demo may use a personal-account URL; QR codes are not printed until the church URL is live.

### QR code

1. **M** Error correction level H (about 30% recoverable), to tolerate paint and decoration.
2. **M** Shortest practical URL, keeping the code at a low QR version (fewer, larger modules).
3. **M** Quiet zone of at least 4 modules on every side.
4. **M** Dark modules on a light background; no inverted or colored codes.
5. **M** Human-readable URL printed with or near the code as a fallback.

### Ornament (laser-cut plywood, family-decorated)

1. **M** QR code on a printed sticker (matte, not glossy, to avoid glare), applied before the event, on a flat face.
2. **M** Sticker sized so the code is at least about 25 mm (1 in) square; final size set by scan testing.
3. **M** The sticker area is clearly marked as "don't paint here" (for example a raised or engraved border cut into the ornament).
4. **N** Laser-engrave the URL text directly into the wood as a permanent fallback if the sticker is damaged.
5. **N** A clear protective coat over the sticker, if testing shows it doesn't add glare.
6. **M** Scan test with at least 5 phones (older iPhone, older Android, current models), under indoor lighting, at sizes being considered, before ordering stickers in bulk.
7. Laser-engraving the QR code itself into plywood is not recommended: wood grain and char give poor contrast. It could be revisited if testing proves otherwise.

## Technical requirements

The app is built with Vite, TypeScript and Svelte, and compiles to a folder of static files with no server code. The visual design is a swappable layer on top of a shared core, so the same build can be a simple guide page or an animated Advent calendar.

### Architecture

1. **M** Static files only. The build outputs a `dist/` folder: HTML, hashed JS/CSS bundles, the content, `manifest.webmanifest`, icons, `sw.js`, and `advent.ics`.
2. **M** No external runtime dependencies: no CDN scripts, web fonts from third parties, or embedded trackers. Everything is served from the app's own origin.
3. **M** Served over HTTPS with standard compression (gzip/brotli) handled by the host.
4. **M** Total first-load size small enough to open quickly on a weak cell signal; target under 500 KB excluding optional images and animation assets.
5. Flutter web and React are out of scope: heavy runtimes for a few pages, and Flutter web has weak accessibility.

### Framework and project structure

The framework must support every design option still on the table, from a simple landing-and-guide page to an animated calendar with openable doors and activity pop-ups.

1. **M** Build stack: Vite + TypeScript + Svelte. Svelte compiles components to small plain JS, and has built-in transitions and animation for doors, modals and celebrations without extra libraries.
2. **M** Three layers, with dependencies pointing one way only (views → core → content):
    - **Content:** the content file plus a typed schema, validated at build time.
    - **Core:** framework-free TypeScript for the schedule (current week/day, date override), progress (local check-offs, streaks), and storage (safe `localStorage` wrapper). Unit tested.
    - **Views:** Svelte components that only render and call core functions.
3. **M** Presentations are interchangeable. A "guide" view (week list and activity cards) and a "calendar" view (doors that open to activities) are both built from the same shared components, and one config value picks which is shown. Adding a design must not require touching core or content.
4. **M** Shared, reusable components: activity card, activity modal (native `<dialog>` for accessibility), week navigation, check box, progress/streak display.
5. **M** Visual design lives in theme tokens (CSS custom properties for colors, type, spacing), so restyling doesn't touch component logic.
6. **M** Animations respect `prefers-reduced-motion` and never block reaching content; every door and modal is keyboard and screen-reader operable.
7. **M** Build-time scripts generate `advent.ics` and validate content from the same source.
8. **M** The PWA manifest and service worker are generated by the build (for example `vite-plugin-pwa`), not hand-maintained.
9. **M** One-command local dev, test and build; CI builds and deploys on push to the main branch.

Indicative layout (final structure set in the design phase):

```
advent/
  content/
    advent-2026.json      # all activity text; the only file typo fixes touch
    schema.ts             # types + validation
  src/
    core/                 # schedule.ts, progress.ts, storage.ts (+ tests)
    components/           # ActivityCard, ActivityModal, WeekNav, Checkbox, Progress
    views/
      GuideView.svelte    # simple landing + guide
      CalendarView.svelte # animated doors
    theme/                # tokens.css
    App.svelte            # picks the view from config
    main.ts
  scripts/
    build-ics.ts
    validate-content.ts
  public/                 # icons, images
  vite.config.ts
```

### Installable app (PWA)

1. **M** Web app manifest with name, icons and theme color, so "Add to Home Screen" gives an app-like icon.
2. **M** A brief in-app tip on how to add to the Home Screen (iPhone and Android).
3. **N** A minimal service worker (`sw.js`) for instant loads and offline viewing. It must be a separate file (browsers don't allow inline service workers). Strategy: network-first for `index.html` and content, so fixes appear on the next online visit; cache-first for icons and images.
4. **M** The app works fully without the service worker; it is an enhancement only.
5. Known limitation: on iOS, a Home Screen app has separate storage from Safari, so check-offs made in Safari don't carry over after installing.

### Visual assets

1. **M** Any graphic that changes state (wreath candles, calendar doors, progress) is SVG, with each changing part as a named element the app can toggle and animate.
2. **M** All motion (flame flicker, door opening, celebrations) is CSS/Svelte transitions that are disabled or reduced under `prefers-reduced-motion`; content is always reachable without animation.
3. **M** One chosen style direction, set before assets are made; colors come from theme tokens where possible.
4. **M** Static images may be raster (compressed WebP); all SVGs are optimized (SVGO); every meaningful image has alt text.
5. **M** Any purchased, AI-generated or donated art has terms that permit use by the church on the web.
6. **N** Sources in preference order: hand-built or code-drawn SVG, licensed stock vectors, congregation art, AI-generated backgrounds with vector overlays.
7. Wreath details are decided: three purple candles, one rose (Week 3) and a white Christ candle in the center; candles light by calendar date. Visual source of truth: `docs/design/` (direction C, "Soft storybook").

### Browser and device support

1. **M** Current and previous two major versions of Safari (iOS and macOS), Chrome (Android and desktop), Edge and Firefox.
2. **M** Usable on phones from about 360 px wide up to large desktop monitors.
3. **M** Works in in-app browsers (email and social apps).

### Accessibility

1. **M** Meets WCAG 2.2 AA: color contrast, keyboard navigation, screen-reader labels, visible focus.
2. **M** Readable default text (about 18 px body) that scales with browser and OS text-size settings.
3. **M** Large tap targets (at least 44 × 44 px) for check boxes and navigation.
4. **M** Plain language; no reliance on icons or color alone.
5. **M** Respects reduced-motion settings: under `prefers-reduced-motion: reduce`, no animation plays at all.
6. **M** Kid-friendly targets: 56 px for primary buttons, check boxes and week chips; 44 px minimum everywhere else.
7. **M** Short, plain words a young child can follow with a parent, and a visible text label next to every icon.
8. **M** Nothing shames missed weeks or unchecked items.

### Privacy

1. **M** No data collection of any kind: no analytics, cookies, forms, or third-party requests.
2. **M** No names, photos, or other personal information about members or children in content.
3. **M** A one-line privacy note in the app: nothing leaves your device.
4. **M** Host-level access logs (kept by any hosting provider) are acknowledged and not used.

## Hosting and domain

Preferred: hosting and DNS owned by the church, with at least two people holding access. Personal accounts are acceptable for the demo and as a fallback only.

### Hosting requirements

1. **M** Serves static files over HTTPS on a custom subdomain.
2. **M** Automatic compression; short cache lifetimes (or revalidation) on HTML so fixes show up within minutes.
3. **M** Free or near-free, with no surprise usage bills.
4. **M** Owned by a church account, not an individual, with documented access for a second maintainer.
5. **N** Deploys from a git repository, with history and one-click rollback.

### Options

| Option | Cost | Custom domain + HTTPS | Fit | Notes |
| --- | --- | --- | --- | --- |
| GitHub Pages (church GitHub org) | Free | Yes | Strong | Public repo on the free plan, which is fine for this content; deploys on push |
| Cloudflare Pages | Free tier | Yes | Strong | Preview URL per change, useful for review; fits well if church DNS is already on Cloudflare |
| Netlify | Free tier | Yes | Strong | Similar to Cloudflare Pages |
| Church's existing website platform | Already paid | Yes (existing domain) | Depends | Simplest ownership; must allow uploading custom HTML/JS files, a manifest and a service worker at the subdomain's root |
| AWS S3 + CloudFront | Small, metered | Yes | Weak | Works, but overkill and ties billing to an account someone must own |
| Google Drive | n/a | n/a | Not viable | Drive no longer serves HTML as websites |

The demo will run on a personal GitHub Pages or Cloudflare Pages account at its default URL, then move to the church's account and subdomain.

## Milestones and open items

The first milestone is a simple placeholder demo in the next few days; everything else works back from the opening event and the Nov 29 start.

### Milestones

- [ ] Demo: placeholder content, week navigation, current-week landing, local check-offs, Add-to-Home-Screen; hosted on a personal account
- [ ] Church IT: subdomain and hosting account confirmed
- [ ] Final content delivered by the content team
- [ ] QR sticker scan tests passed; stickers ordered (allow print lead time)
- [ ] Production deploy on the church subdomain, with `.ics` feed
- [ ] Dry run with a few families, including at least one parent with young kids on a phone (and one check on a desktop)
- [ ] Opening event: ornaments with QR stickers
- [ ] Season runs Nov 29 – Dec 25; post-season archive page goes up

### Open items

- [ ] What hosting, DNS and accounts can the church provide that don't depend on Cameron's personal accounts? Who is the second maintainer?
- [ ] Date of the opening event, and how many ornaments are needed.
- [ ] Who owns the content, and when is it final?
- [ ] Weekly items only, or daily prompts too?
- [ ] Does the content include song lyrics, hymn texts or scripture that need licensing or permission?
- [ ] What happens at the URL after Dec 25, and in future years?
- [ ] Does the church's existing website platform support this, or is a separate static host needed?
- [ ] Branding: logo, if any. (Colors and the app name "Advent Devotional" are decided.)

### Decisions made

- Static PWA with no backend; no native apps.
- Check-offs are local-only; no accountability or reporting.
- No data collection; analytics deferred to a future year.
- Content kept separate from code; edits are for typos and fixes, not major changes.
- `.ics` calendar feed is the reminder mechanism.
- Church-owned subdomain in the QR code; personal accounts only for the demo and as a fallback.
- Printed versions are produced separately and are out of scope.
- Detailed design and build begin once this document is final.
- Audience is the Children & Family ministries (parents and kids together, phone first).
- Visual direction C, "Soft storybook" (`docs/design/`), with the Baloo 2 font self-hosted.
- Default view is the Advent wreath; the weekly list stays available as the "Week list" view.
- App name: "Advent Devotional".
- Church events and rehearsals live in the content file, published as separate calendar feeds plus a combined one, and shown in the app.
