import {
  computeTabooScores,
  currentTurn,
  isCorrectGuess,
  isLastTurn,
} from '@/features/gameplay/taboo/tabooRound';
import type { RoomEvent, RoomState, TabooGuess } from '@/types';
import { addPoints } from '@/utils/room';

/**
 * TABOO's transition handlers live here rather than in roomMachine.ts, purely
 * to keep that file under its line cap: same shape and the same guards as
 * their STOP and QUIZ counterparts, just physically split by cartridge.
 */

export const guessTaboo = (state: RoomState, guess: TabooGuess): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'TABOO') return state;
  // The clue-giver never guesses their own card; the UI never offers them the
  // input, but the reducer refuses it too rather than trust that alone.
  if (currentTurn(round)?.clueGiverId === guess.playerId) return state;
  // First guess stands: nobody changes their mind after seeing a reaction.
  if (round.guesses.some((entry) => entry.playerId === guess.playerId)) return state;

  return { ...state, currentRound: { ...round, guesses: [...round.guesses, guess] } };
};

/**
 * Every guesser has answered; pull the deadline in instead of waiting out the
 * clock, the same "only ever shortens it" guard QUIZ_ALL_ANSWERED uses.
 */
export const allTabooGuessed = (state: RoomState, endsAt: string): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'TABOO') return state;
  if (round.endsAt !== null && round.endsAt <= endsAt) return state;

  return { ...state, currentRound: { ...round, endsAt } };
};

/**
 * The clock ran out on the turn. Guesses are pre-filled by exact match — a
 * courtesy suggestion — but nothing is added to anyone's score until the Host
 * confirms it, the same safety net STOP already has for typed answers (#141).
 */
export const endTabooTurn = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'TABOO') return state;

  const word = currentTurn(round)?.card.word ?? '';
  const guesses = round.guesses.map((guess) => ({
    ...guess,
    isValid: isCorrectGuess(guess.value, word) ? true : null,
  }));

  return {
    ...state,
    status: 'CALCULATING_SCORES',
    currentRound: { ...round, guesses, isScored: false },
  };
};

export const judgeGuess = (
  state: RoomState,
  event: Extract<RoomEvent, { type: 'GUESS_JUDGED' }>,
): RoomState => {
  const round = state.currentRound;
  if (round?.game !== 'TABOO') return state;

  const guesses = round.guesses.map((guess) =>
    guess.playerId === event.playerId ? { ...guess, isValid: event.isValid } : guess,
  );

  return { ...state, currentRound: { ...round, guesses } };
};

/**
 * Judging every guess one by one is the honest default, but this accepts
 * everything still pending, leaving whatever the Host already rejected
 * untouched — same escape hatch STOP's validation screen offers.
 */
export const approveRemainingGuesses = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (round?.game !== 'TABOO') return state;

  const guesses = round.guesses.map((guess) =>
    guess.isValid === null ? { ...guess, isValid: true } : guess,
  );

  return { ...state, currentRound: { ...round, guesses } };
};

/**
 * The Host has confirmed the turn. Unlike STOP's ROUND_SCORED, this moves on
 * to SHOWING_ANSWER rather than staying put: a turn is only one stop on the
 * way through the match, not the end of it.
 */
export const scoreTurn = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (round?.game !== 'TABOO' || round.isScored) return state;

  const earned = computeTabooScores(round);
  return {
    ...state,
    status: 'SHOWING_ANSWER',
    scores: addPoints(state.scores, earned),
    currentRound: {
      ...round,
      turnPoints: earned,
      matchPoints: addPoints(round.matchPoints, earned),
      isScored: true,
    },
  };
};

/**
 * The Host has finished the reveal. One more clue-giver means a fresh clock
 * and an empty guess sheet; nobody left means the match is done.
 */
export const nextTabooTurn = (state: RoomState, endsAt: string): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'SHOWING_ANSWER' || round?.game !== 'TABOO') return state;

  if (isLastTurn(round)) {
    return {
      ...state,
      status: 'CALCULATING_SCORES',
      lastRoundPoints: round.matchPoints,
      currentRound: { ...round, isScored: true },
    };
  }

  return {
    ...state,
    status: 'PLAYING',
    currentRound: {
      ...round,
      currentIndex: round.currentIndex + 1,
      guesses: [],
      turnPoints: {},
      endsAt,
    },
  };
};
