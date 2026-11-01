# How to fix a typo (no tools needed)

All the words in the app live in one file: `content/advent-2026.json`.

1. On GitHub, open the repository and click `content` → `advent-2026.json`.
2. Click the pencil icon (“Edit this file”).
3. Find the text and fix it. **Only change the words inside the quotes.**
   - Don't change any `"id"` values. They're how the app remembers families' check-offs.
   - Keep the quote marks, commas and brackets exactly as they are.
   - To use a quote mark inside text, write `\"` (for example `\"Happy Birthday\"`).
4. Click **Commit changes**, add a short note (e.g. “Fix typo in Week 2”), and commit.
5. Within a few minutes the site rebuilds automatically. Check the **Actions** tab:
   - ✅ green: the fix is live. Families see it the next time they open the app online.
   - ❌ red: something in the file isn't right. Open the failed run, and the “Build” step
     lists the problem in plain words (e.g. `week "week-2", activity #3: missing or empty "title"`).
     Fix it the same way, or undo your change. The live site stays as it was until a build passes.

## What each field means

| Field         | What it is                                                     |
| ------------- | -------------------------------------------------------------- |
| `title`       | Heading for a week or activity                                 |
| `intro`       | Short paragraph under the week's title                         |
| `description` | The main text of an activity                                   |
| `details`     | Optional longer text, shown when someone taps “More”           |
| `scripture`   | Optional reference only, e.g. `Luke 2:1–20`                    |
| `link`        | Optional `{ "href": "https://…", "label": "Link text" }`       |
| `date`        | Optional `YYYY-MM-DD` to tie an activity to one day of a week  |
| `id`          | Stable name the app uses for check-offs. **Never change it.**  |
| `shortTitle`  | Optional short week name for the buttons under the wreath (e.g. `Jesus`). Keep it to 7 letters or fewer. Without it, the week's `title` is used |
| `candle`      | Which wreath candle the week lights: `"1"`, `"2"`, `"3"` (the pink one), `"4"` or `"christ"`. Each candle can be used once |
| `doneMessage` | Optional line shown when a family checks off every activity in the week, e.g. `The Hope candle is shining.` Keep it cheerful and short |

Adding a new activity is fine. Give it a new, unique `id` (lowercase letters, numbers and
dashes, e.g. `w2-bake-cookies`).

## Church events and rehearsals

Events are near the bottom of the file, under `"events"`. Each one looks like this:

```json
{
  "id": "childrens-pageant",
  "feed": "events",
  "title": "Children's Christmas pageant",
  "date": "2026-12-20",
  "start": "10:00",
  "end": "11:00",
  "location": "Sanctuary",
  "description": "The kids tell the Christmas story during worship."
}
```

| Field               | What it is                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `id`                | Stable name for the event. Calendars use it to update the event, so **never change it**        |
| `feed`              | `"events"` for services and special events, `"rehearsals"` for rehearsals                      |
| `title`             | Name of the event                                                                               |
| `date`              | `YYYY-MM-DD`. For a weekly event, the first date                                                |
| `start`, `end`      | Optional 24-hour times in Denver time, e.g. `"18:30"` for 6:30 pm. Leave both out for all day  |
| `location`          | Optional place, e.g. `"Fellowship Hall"`                                                       |
| `description`       | Optional short line about the event                                                             |
| `repeatWeeklyUntil` | Optional. Repeats on the same weekday every week through this date                              |
| `skip`              | Optional list of dates a weekly event doesn't happen, e.g. `["2026-11-25"]`                     |
| `cancelled`         | Optional. Set to `true` to cancel. Don't delete a cancelled event: leaving it in tells subscribed calendars it's off |

- **Changing a time or place:** edit it in place and keep the `id`. Subscribed calendars update the event instead of adding a second one.
- **Adding an event:** copy an existing one, give it a new unique `id` (lowercase letters, numbers and dashes) and change the details.
- Times are always Denver time (`"timeZone": "America/Denver"` near the top of the file). Calendars show them in each person's own time zone.

## Calendar names

The names and descriptions of the calendars people can subscribe to are under `"feeds"` near the top of the file. Change any `title`, `description` or `label` (the short word shown on each event in the app, such as "Rehearsal"). Don't change the `id` values (`all`, `reminders`, `events`, `rehearsals`): they name the calendar files.

## Calendar subscribers

`advent.ics` is rebuilt from this same file, so calendar reminders always match. Google
Calendar can take many hours to pick up changes, so finish edits to week titles and dates
before announcing the calendar link.
