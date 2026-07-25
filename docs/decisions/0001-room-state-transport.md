# 0001 — Seats from Presence, FSM from the row, answers from Broadcast

**Status:** Accepted — 2026-07-24

## Context

RLS makes `public.rooms` writable only by the Host (`host_id = auth.uid()`),
which is the database-side twin of the role model: Clients are read-only state
listeners. That single rule forces a decision for every piece of shared state,
because a student cannot write to the room row at all — not even to take a seat.

## Decision

Three different transports, each matching what the data actually is:

| State                          | Lives in                    | Why                                                            |
| ------------------------------ | --------------------------- | -------------------------------------------------------------- |
| Seats (who is connected)       | Realtime **Presence**       | Ephemeral by nature; a disconnect must free the seat by itself |
| FSM (status, cartridge, round) | `rooms.state` **JSONB row** | Must survive a refresh; single writer, so no contention        |
| Answers during a round         | Realtime **Broadcast**      | Six students writing at once; the Host consolidates            |

The Host mirrors the presence-derived board back into the row, so the seat count
is accurate for the `ROOM_FULL` check and for a late joiner.

## Alternatives rejected

- **Seats in the table.** Would need a policy letting each player write its own
  slot, plus cleanup for players who vanish without leaving. Presence gives both
  for free.
- **Answers in an `answers` table.** Needs an insert policy per player and six
  concurrent writers per round. The blueprint says Clients "only broadcast
  answers"; RLS already pushes the same way.
- **Everything over Broadcast.** Nothing would survive a refresh.

## Amendment (2026-07-25): the Host does not listen to itself

The Host originally applied the row updates it received like everyone else. That
was wrong, and it corrupted state: the echo of a write arrives asynchronously, so
a second click landing before the echo of the first was silently reverted about a
second later. Measured in the browser — the cartridge selection turned on at
+300ms and back off at +1s, with no error anywhere.

RLS makes the Host the only writer, so the row can tell it nothing it does not
already know. `useRoomStateSync` now subscribes only when the local participant
is a Client. The rule generalises: **a single writer must not treat its own
broadcast as input**.

Known limit: two Host tabs sharing one identity (see #4) would both write and
neither would hear the other. Out of scope while a Host is one tab.

## Consequences

- `buildSlotsFromPresence` rebuilds the whole board on every sync, so nothing
  durable may live on a `Player`. See [0002](0002-scores-live-on-room.md).
- The Host is a single point of failure during a round: if it drops, nobody
  consolidates the answers.
- Two tabs of the same browser share one anonymous identity and therefore one
  seat. Testing Host and Client together needs a second origin or a private
  window.
