# 0007 — The bot is a Host-run seat outside Presence

**Status:** Accepted — 2026-10-21

## Context

A first-time Host with nobody to invite cannot start QUIZ or TABOO
([0006](0006-stop-plays-solo.md)). STOP now plays alone; QUIZ needed something
to play against ([#155](https://github.com/marcelotust/education-portal/issues/155)).

Seats come from Presence and `PLAYERS_SYNCED` rewrites the whole board on every
sync ([0001](0001-room-state-transport.md)), so a bot stored in `slots` would be
erased by the next sync. The join guard also counts `slots` as real people.

## Decision

The bot is `RoomState.bot`, one optional `Player` (`isBot: true`, id `bot:1`),
persisted with the room row and kept out of `slots`. Wherever the room shows or
plays everyone, `seatedPlayers` / `seatedBoard` / `seatedCount` (in
`src/utils/room.ts`) add it; `countPlayers` stays the real-people count.

The Host's browser plays for it (`useQuizBot`): after a pause of 40-85% of the
time left it dispatches the same `QUIZ_ANSWERED` anyone else would, right half
the time. No server is involved; the Host is already the single writer.

`ADD_BOT` and `REMOVE_BOT` are Host-only and lobby-only.

## Consequences

- **Real Players win seats.** When six people hold the slots, the bot is
  dropped (`yieldSeatToPlayers`), and `joinRoom` never counted it, so a bot can
  never turn a person away.
- **STOP and TABOO ignore the bot.** They read `slots`, so it sits out with no
  extra code. It reaches the scoreboard only after it has scored.
- **Cartridges say what they accept:** `playsWithout` is `BOT` for QUIZ.
  TABOO stays `PLAYERS`: a bot cannot give or read free-text clues.
- The bot is a trial aid, not a player: `game_started` and `game_completed`
  carry `has_bot`, and `bot_added` is its own event, so it does not read as
  adoption.
