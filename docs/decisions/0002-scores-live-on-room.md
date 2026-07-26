# 0002 — Scores live on the room, not on the player

**Status:** Accepted — 2026-07-25

## Context

`Player` originally carried a `score` field, which is where anyone would expect
to find it.

It would have been silently wrong. Seats come from Realtime Presence
(see [0001](0001-room-state-transport.md)), and `buildSlotsFromPresence`
**rebuilds every `Player` object on every sync**. Any score living there would
reset the moment somebody joined or left the room — mid-session, without an
error, looking like a bug in the scoring rules rather than in the data model.

## Decision

`score` was removed from `Player`. `RoomState.scores` is a map keyed by player
id, persisted in the room row and accumulated across rounds.

The key is the anonymous Supabase user id, which survives a refresh in
`localStorage`, so a student who reloads keeps their points.

## Consequences

- Anything durable about a participant belongs on the room, not on the seat.
  The seat is a live view of who is connected, nothing more.
- Rows written before the field existed default to `{}` in `rowToRoomState`
  instead of crashing the scoreboard.
- Scores accumulate across rounds for the life of the match, not the room.
  `RETURN_TO_LOBBY` keeps them — that is the point, between rounds of one
  session — and `MATCH_RESET` zeroes `scores` and `lastRoundPoints` together
  when a new class arrives. It is guarded to `LOBBY_IDLE`, so a reset can never
  land on a round in flight, and the Host has to confirm it: the room, the PIN
  and the seats survive, which is exactly why the action exists.
