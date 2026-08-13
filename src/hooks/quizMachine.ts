import { isLastQuestion } from '@/features/gameplay/quiz/quizRound';
import type { QuizAnswer, RoomState } from '@/types';

/**
 * QUIZ's transition handlers live here rather than in roomMachine.ts, purely
 * to keep that file under its line cap: same shape and the same guards as
 * their STOP and TABOO counterparts, just physically split by cartridge.
 */

export const answerQuiz = (state: RoomState, answer: QuizAnswer): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'QUIZ') return state;
  // First answer stands: nobody changes their mind after seeing a reaction.
  if (round.answers.some((entry) => entry.playerId === answer.playerId)) return state;

  return { ...state, currentRound: { ...round, answers: [...round.answers, answer] } };
};

/**
 * Every seated player has picked, so waiting out the full clock only leaves
 * them staring at a countdown with nothing left to do. Pulling the deadline
 * in lets the existing clock-driven END_ROUND close the round, the same way
 * STOP's early end works: this only ever shortens it, never pushes it out.
 */
export const allAnswered = (state: RoomState, endsAt: string): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'QUIZ') return state;
  if (round.endsAt !== null && round.endsAt <= endsAt) return state;

  return { ...state, currentRound: { ...round, endsAt } };
};

/**
 * The Host has finished talking about the answer. One more question means a
 * fresh clock and an empty answer sheet; nothing left means the match is done,
 * and what it was worth as a whole is what the scoreboard reports.
 */
export const nextQuestion = (state: RoomState, endsAt: string): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'SHOWING_ANSWER' || round?.game !== 'QUIZ') return state;

  if (isLastQuestion(round)) {
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
      answers: [],
      questionPoints: {},
      endsAt,
    },
  };
};
