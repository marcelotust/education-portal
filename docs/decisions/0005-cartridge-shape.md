# 0005 — Cartridges are a discriminated union, not a shared round shape

**Status:** Accepted — 2026-07-25

## Context

With only STOP built, `RoomState.currentRound` _was_ a `StopRound`, and the FSM
had absorbed its shape: a validation phase, a letter, categories, answers judged
one by one. The states (`PLAYING_AD → PLAYING → CALCULATING_SCORES`) looked
game-agnostic; everything hanging off them was not.

QUIZ was chosen as the second cartridge precisely because it breaks those
assumptions: it has no validation phase at all, because a right answer is a
right answer.

## Decision

`Round` is a discriminated union on `game`, and so is `GameSetup`. Selecting a
cartridge swaps the setup for that game's defaults.

The FSM states stayed exactly as they were. What changed is that each handler
narrows to the cartridge it belongs to: `ANSWER_JUDGED`, `STOP_CALLED` and the
whole validation flow refuse anything that is not a `StopRound`, and
`QUIZ_ANSWERED` refuses anything that is not a `QuizRound`.

`END_ROUND` is where the two genuinely differ: STOP hands the round to the Host
to judge, QUIZ scores itself on the spot and everyone lands on the scoreboard.

## Consequences

- The five FSM states survived contact with a second game, which is evidence
  they were the right abstraction. The round payload was not.
- A third cartridge adds a variant and a screen; it does not touch the states.
- Scoring is per-cartridge (`scoring.ts` for STOP, `quiz/quizRound.ts` for
  QUIZ) but both feed the same `RoomState.scores`, so points accumulate across
  different games in one session.
- `RoomStage` now branches on `currentRound.game` for the playing state, and
  `CALCULATING_SCORES` shows validation or the scoreboard depending on whether
  the round arrived already scored.

Closes [#3](https://github.com/marcelotust/education-portal/issues/3).
