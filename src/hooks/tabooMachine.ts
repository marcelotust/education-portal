import { currentTurn, isLastTurn } from '@/features/gameplay/taboo/tabooRound';
import type { RoomState, TabooGuess } from '@/types';

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
