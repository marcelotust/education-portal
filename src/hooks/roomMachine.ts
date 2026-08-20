import { DEFAULT_STOP_GAME_SETUP } from '@/features/gameplay/stopRound';
import { DEFAULT_QUIZ_SETUP, computeQuizScores } from '@/features/gameplay/quiz/quizRound';
import { computeRoundScores } from '@/features/gameplay/scoring';
import { DEFAULT_TABOO_SETUP } from '@/features/gameplay/taboo/tabooRound';
import {
  MAX_PLAYERS,
  MIN_CATEGORIES,
  type GameId,
  type GameSetup,
  type RoomEvent,
  type RoomEventType,
  type RoomState,
} from '@/types';
import { addPoints, releaseSlot, sameBoard, seatPlayer } from '@/utils/room';
import { allAnswered, answerQuiz, nextQuestion } from './quizMachine';
import {
  allTabooGuessed,
  approveRemainingGuesses,
  endTabooTurn,
  guessTaboo,
  judgeGuess,
  nextTabooTurn,
  scoreTurn,
} from './tabooMachine';

/** Presence events are broadcast by the infrastructure, not by the Host. */
const PRESENCE_EVENTS: readonly RoomEventType[] = [
  'PLAYER_JOINED',
  'PLAYER_LEFT',
  'PLAYERS_SYNCED',
  // Broadcast by the room row, which only the Host can write anyway.
  'ROOM_STATE_RECEIVED',
  // Every player broadcasts its own answers; the Host consolidates them.
  'ANSWERS_SUBMITTED',
  'QUIZ_ANSWERED',
  'TABOO_GUESSED',
  // Broadcast fast-path twin of a Host-only event; see its doc comment (#105).
  'QUIZ_DEADLINE_RECEIVED',
];

export const isHostOnlyEvent = (event: RoomEvent): boolean => !PRESENCE_EVENTS.includes(event.type);

/**
 * Answers arrive over Broadcast, so the same player can send twice (retry,
 * reconnect, or STOP right as the timer fires). The last submission wins.
 */
const submitAnswers = (
  state: RoomState,
  event: Extract<RoomEvent, { type: 'ANSWERS_SUBMITTED' }>,
): RoomState => {
  const round = state.currentRound;
  if (round?.game !== 'STOP') return state;

  const others = round.answers.filter((answer) => answer.playerId !== event.playerId);
  return { ...state, currentRound: { ...round, answers: [...others, ...event.answers] } };
};

const defaultSetupFor = (gameId: GameId): GameSetup => {
  if (gameId === 'QUIZ') return { game: 'QUIZ', ...DEFAULT_QUIZ_SETUP };
  if (gameId === 'TABOO') return { game: 'TABOO', ...DEFAULT_TABOO_SETUP };
  return DEFAULT_STOP_GAME_SETUP;
};

/**
 * STOP needs four categories; TABOO's real constraint is card supply rather
 * than a category count, so one is enough to start; QUIZ ships with its packs
 * and is always ready.
 */
const isSetupPlayable = (state: RoomState): boolean => {
  if (state.selectedGameId === null) return false;
  if (state.gameSetup.game === 'STOP') return state.gameSetup.categories.length >= MIN_CATEGORIES;
  if (state.gameSetup.game === 'TABOO') return state.gameSetup.categories.length >= 1;
  return true;
};

/**
 * STOP and TABOO hand the round to the Host to judge before it counts. QUIZ
 * has nothing to judge, so it scores itself on the spot and stops on the
 * reveal: the match is only over once the Host walks past the last question.
 */
const endRound = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (round === null) return { ...state, status: 'CALCULATING_SCORES' };

  if (round.game === 'STOP') {
    return {
      ...state,
      status: 'CALCULATING_SCORES',
      currentRound: { ...round, phase: 'VALIDATION_PHASE' },
    };
  }

  if (round.game === 'TABOO') return endTabooTurn(state);

  const earned = computeQuizScores(round);
  return {
    ...state,
    status: 'SHOWING_ANSWER',
    scores: addPoints(state.scores, earned),
    currentRound: {
      ...round,
      questionPoints: earned,
      matchPoints: addPoints(round.matchPoints, earned),
    },
  };
};

/** Order matters: categories appear in the round exactly as the Host picked them. */
const toggleCategory = (state: RoomState, category: string): RoomState => {
  if (state.gameSetup.game !== 'STOP' && state.gameSetup.game !== 'TABOO') return state;
  const { categories } = state.gameSetup;
  const next = categories.includes(category)
    ? categories.filter((entry) => entry !== category)
    : [...categories, category];

  return { ...state, gameSetup: { ...state.gameSetup, categories: next } };
};

/**
 * Someone filled every category and hit STOP. Rather than ending the round on
 * the spot, the deadline is pulled in to a couple of seconds: every other
 * player's screen then runs the same countdown it already knows how to run,
 * auto-submitting whatever they had typed. Nothing in flight is lost.
 */
const callStop = (state: RoomState, playerId: string, endsAt: string): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'STOP') return state;
  // A later deadline never wins: STOP only ever shortens the round.
  if (round.endsAt !== null && round.endsAt <= endsAt) return state;

  // The first caller keeps the credit even if a second STOP lands.
  return { ...state, currentRound: { ...round, endsAt, stoppedBy: round.stoppedBy ?? playerId } };
};

const judgeAnswer = (
  state: RoomState,
  event: Extract<RoomEvent, { type: 'ANSWER_JUDGED' }>,
): RoomState => {
  const round = state.currentRound;
  // Only STOP has anything to judge; QUIZ marks itself.
  if (round?.game !== 'STOP') return state;

  const answers = round.answers.map((answer) =>
    answer.playerId === event.playerId && answer.category === event.category
      ? { ...answer, isValid: event.isValid }
      : answer,
  );

  return { ...state, currentRound: { ...round, answers } };
};

/**
 * Judging every answer one by one is the honest default, but eight categories
 * across six players is forty-eight taps. This accepts everything still
 * pending, leaving whatever the Host already rejected untouched.
 */
const approveRemaining = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (round?.game !== 'STOP') return state;

  const answers = round.answers.map((answer) =>
    answer.isValid === null ? { ...answer, isValid: true } : answer,
  );

  return { ...state, currentRound: { ...round, answers } };
};

/** Points are added to the running total, never replacing earlier rounds. */
const scoreRound = (state: RoomState): RoomState => {
  const round = state.currentRound;
  // QUIZ scores itself when the round ends; this is the Host confirming STOP.
  if (round?.game !== 'STOP' || round.isScored) return state;

  const seated = state.slots.filter((slot) => slot !== null).map((slot) => slot.id);
  const earned = computeRoundScores(round, seated);

  const scores = { ...state.scores };
  for (const [playerId, points] of Object.entries(earned)) {
    scores[playerId] = (scores[playerId] ?? 0) + points;
  }

  return { ...state, scores, lastRoundPoints: earned, currentRound: { ...round, isScored: true } };
};

/**
 * A new class arrives and the room stays: same PIN, same seats, the points of
 * whoever played before wiped. Only from the lobby, so a match can never be
 * reset out from under a round in flight.
 */
const resetMatch = (state: RoomState): RoomState => {
  if (state.status !== 'LOBBY_IDLE') return state;

  const nothingToClear =
    Object.keys(state.scores).length === 0 && Object.keys(state.lastRoundPoints).length === 0;

  return nothingToClear ? state : { ...state, scores: {}, lastRoundPoints: {} };
};

/**
 * Pure Finite State Machine for a persistent room.
 * Invalid transitions return the exact same object so React can bail out.
 */
export const roomReducer = (state: RoomState, event: RoomEvent): RoomState => {
  switch (event.type) {
    case 'OPEN_GAME_CONFIG':
      return state.status === 'LOBBY_IDLE' ? { ...state, status: 'CONFIGURING_GAME' } : state;

    case 'CANCEL_GAME_CONFIG':
      return state.status === 'CONFIGURING_GAME'
        ? { ...state, status: 'LOBBY_IDLE', selectedGameId: null }
        : state;

    case 'SELECT_GAME':
      // Each cartridge brings its own setup panel, so the setup swaps with it.
      return state.status === 'CONFIGURING_GAME'
        ? { ...state, selectedGameId: event.gameId, gameSetup: defaultSetupFor(event.gameId) }
        : state;

    case 'ROUND_DURATION_SELECTED':
      return state.status === 'CONFIGURING_GAME'
        ? { ...state, gameSetup: { ...state.gameSetup, roundDurationSeconds: event.seconds } }
        : state;

    case 'CATEGORY_TOGGLED':
      return state.status === 'CONFIGURING_GAME' &&
        (state.gameSetup.game === 'STOP' || state.gameSetup.game === 'TABOO')
        ? toggleCategory(state, event.category)
        : state;

    case 'QUIZ_TOPIC_SELECTED':
      return state.status === 'CONFIGURING_GAME' && state.gameSetup.game === 'QUIZ'
        ? { ...state, gameSetup: { ...state.gameSetup, topic: event.topic } }
        : state;

    case 'QUIZ_QUESTION_COUNT_SELECTED':
      return state.status === 'CONFIGURING_GAME' && state.gameSetup.game === 'QUIZ'
        ? { ...state, gameSetup: { ...state.gameSetup, questionCount: event.count } }
        : state;

    case 'QUIZ_ANSWERED':
      return answerQuiz(state, event.answer);

    case 'NEXT_QUESTION':
      return nextQuestion(state, event.endsAt);

    case 'QUIZ_ALL_ANSWERED':
    case 'QUIZ_DEADLINE_RECEIVED':
      return allAnswered(state, event.endsAt);

    case 'TABOO_GUESSED':
      return guessTaboo(state, event.guess);

    case 'TABOO_ALL_GUESSED':
      return allTabooGuessed(state, event.endsAt);

    case 'NEXT_TABOO_TURN':
      return nextTabooTurn(state, event.endsAt);

    case 'START_GAME':
      // Each cartridge decides what "ready" means, here and not just in the UI.
      return state.status === 'CONFIGURING_GAME' && isSetupPlayable(state)
        ? { ...state, status: 'PLAYING_AD' }
        : state;

    case 'AD_FINISHED':
      return state.status === 'PLAYING_AD'
        ? { ...state, status: 'PLAYING', currentRound: event.round }
        : state;

    case 'ANSWERS_SUBMITTED':
      return submitAnswers(state, event);

    case 'STOP_CALLED':
      return callStop(state, event.playerId, event.endsAt);

    case 'ANSWER_JUDGED':
      return judgeAnswer(state, event);

    case 'REMAINING_ANSWERS_APPROVED':
      return approveRemaining(state);

    case 'ROUND_SCORED':
      return scoreRound(state);

    case 'GUESS_JUDGED':
      return judgeGuess(state, event);

    case 'REMAINING_GUESSES_APPROVED':
      return approveRemainingGuesses(state);

    case 'TURN_SCORED':
      return scoreTurn(state);

    case 'END_ROUND':
      return state.status === 'PLAYING' ? endRound(state) : state;

    case 'RETURN_TO_LOBBY':
      return state.status === 'CALCULATING_SCORES'
        ? { ...state, status: 'LOBBY_IDLE', selectedGameId: null, currentRound: null }
        : state;

    case 'MATCH_RESET':
      return resetMatch(state);

    case 'PLAYER_JOINED':
      return seatPlayer(state, event);

    case 'PLAYER_LEFT':
      return releaseSlot(state, event.playerId);

    case 'ROOM_STATE_RECEIVED': {
      // Everything the row carries is applied except the board: seats come from
      // Presence. Spreading rather than listing fields means a field added later
      // syncs on its own — listing them silently dropped one twice already.
      const { slots: _presenceOwnsSeats, ...flow } = event.state;
      const unchanged = Object.entries(flow).every(
        ([key, value]) => state[key as keyof typeof flow] === value,
      );

      return unchanged ? state : { ...state, ...flow };
    }

    case 'PLAYERS_SYNCED': {
      // Realtime Presence owns the board; it arrives already normalised to 6.
      const slots = Array.from({ length: MAX_PLAYERS }, (_, index) => event.slots[index] ?? null);
      return sameBoard(state.slots, slots) ? state : { ...state, slots };
    }
  }
};
