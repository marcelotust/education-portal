# 0004 — Rooms expire after 5 hours, swept hourly

**Status:** Accepted — 2026-07-25

## Context

Nothing ever closed a room. Every visit to `/host` inserted a row that stayed
`is_open = true` forever, so `public.rooms` only grew. During the MVP validation
every test room had to be deleted by hand.

This stopped being mere clutter once the Host could resume an open room: a class
from three days ago would be offered as if it were still running.

## Decision

**Five hours** without the Host touching the room state means the class is over.

Two halves, deliberately:

1. A **`pg_cron` job, hourly at minute 17**, deletes rooms older than the window.
2. `findResumableRoom` applies **the same window on read**, so the offer is exact
   no matter when the sweep happens to run.

Rooms are **deleted**, not soft-closed.

## Why hourly rather than daily

The same rows get deleted either way — the total work is identical. Hourly keeps
each delete tiny and the table bounded, instead of letting a day of rows pile up
for one large sweep holding locks. Minute 17 avoids the top-of-the-hour stampede.

`pg_cron` runs inside the database: no function invocation, no egress. Waking up
hourly is effectively free, and cheaper than an Edge Function or a Vercel Cron,
which bill per execution.

## Why also filter on read

The cron alone would leave up to an hour where an expired room is still offered.
The read filter closes that gap at zero cost and makes the user-facing rule exact
and independent of the schedule. The sweep becomes pure housekeeping.

## Why delete instead of `is_open = false`

After five hours the scores are of no interest and the row would live forever.
`is_open` still exists and the read policy only exposes open rooms, so a soft
close remains available if a future feature needs history.

## Consequences

- `updated_at` only changes when the **Host writes state**. Presence does not
  warm the row, so a room parked in the lobby for five hours with people present
  would be deleted. Fine for a class, wrong for long-lived rooms — that is the
  knob to turn if that ever changes.
- The window lives in two places, by design: `supabase/migrations/` and
  `RESUMABLE_WINDOW_HOURS` in `src/lib/room/supabaseRoomService.ts`. Change both.

Closes [#2](https://github.com/marcelotust/education-portal/issues/2).
