# 0006 — STOP can be played solo; other cartridges still need company

**Status:** Accepted — 2026-10-21

## Context

[#96](https://github.com/marcelotust/education-portal/issues/96) disabled START
GAME until another Player was seated, on the grounds that EduParty is
multiplayer by design and a one-person round is a broken experience.

The first GA4 readout (51 users, 2026-09-23 to 2026-10-20) showed the cost:
8 users created a room and only 1 ever started a game. A first-time Host who
is only trying the product has nobody to invite yet, so they hit a dead end
before seeing any game.

## Decision

Each cartridge declares what it can start without (`playsWithout` on
`GameCartridge`): `NOTHING`, `BOT` or `PLAYERS`. STOP is `NOTHING`; QUIZ and
TABOO stay `PLAYERS` (QUIZ becomes `BOT` with
[#155](https://github.com/marcelotust/education-portal/issues/155)).

"Can this room start?" is one derived rule, `hasEnoughPlayers` in
`src/features/lobby/canStart.ts`: a real Player always suffices, and a Host
alone can start only a cartridge whose `playsWithout` is `NOTHING`. The picker,
the hint and START GAME all use it, so the order the Host clicks in never
matters.

The game selection screen says so on every card (`SOLO OK`, `BOT OK`,
`NEEDS PLAYERS`), and a Host who is alone gets a note that STOP is better with
more people.

## Consequences

- #96's "100% multiplayer" is narrowed, not dropped: STOP solo is a practice
  mode, and QUIZ and TABOO keep requiring company.
- Solo STOP scores like any round. Every valid answer is unique, so each is
  worth `UNIQUE_POINTS`; the duplicate rule has nothing to bite on. The Host
  still judges their own answers, the same trade-off as
  [0003](0003-anyone-can-host.md).
- `game_started` and `game_completed` carry `solo`, so practice rounds do not
  read as real adoption in GA4.
- The FSM is untouched. The guard lives in the UI, as it did under #96.
