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

Adding a new activity is fine. Give it a new, unique `id` (lowercase letters, numbers and
dashes, e.g. `w2-bake-cookies`).

## Calendar subscribers

`advent.ics` is rebuilt from this same file, so calendar reminders always match. Google
Calendar can take many hours to pick up changes, so finish edits to week titles and dates
before announcing the calendar link.
