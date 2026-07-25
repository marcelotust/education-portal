import { DEFAULT_STOP_GAME_SETUP } from '@/features/gameplay/stopRound';
import { DEFAULT_QUIZ_SETUP, computeQuizScores } from '@/features/gameplay/quiz/quizRound';
import { computeRoundScores } from '@/features/gameplay/scoring';
import {
  MAX_PLAYERS,
  MIN_CATEGORIES,
  type GameId,
  type GameSetup,
  type QuizAnswer,
  type PlayerSlot,
  type RoomEvent,
  type RoomEventType,
  type RoomState,
} from '@/types';

/** Presence events are broadcast by the infrastructure, not by the Host. */
const PRESENCE_EVENTS: readonly RoomEventType[] = [
  'PLAYER_JOINED',
  'PLAYER_LEFT',
  'PLAYERS_SYNCED',
  // Broadcast by the room row, which only the Host can write anyway.
  'ROOM_STATE_RECEIVED',
  // Every player broadcasts its own answers; the Host consolidates them.
  'ANSWERS_SUBMITTED',
];

const sameBoard = (a: readonly PlayerSlot[], b: readonly PlayerSlot[]): boolean =>
  a.length === b.length &&
  a.every((slot, index) => {
    const other = b[index];
    return slot === other || (slot?.id === other?.id && slot?.nickname === other?.nickname);
  });

export const isHostOnlyEvent = (event: RoomEvent): boolean => !PRESENCE_EVENTS.includes(event.type);

const seatPlayer = (state: RoomState, event: Extract<RoomEvent, { type: 'PLAYER_JOINED' }>) => {
  const openSlot = state.slots.findIndex((slot) => slot === null);
  if (openSlot === -1 || state.slots.length > MAX_PLAYERS) return state;

  const slots = state.slots.map((slot, index) => (index === openSlot ? event.player : slot));
  return { ...state, slots };
};

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

const defaultSetupFor = (gameId: GameId): GameSetup =>
  gameId === 'QUIZ' ? { game: 'QUIZ', ...DEFAULT_QUIZ_SETUP } : DEFAULT_STOP_GAME_SETUP;

/** STOP needs four categories; QUIZ ships with its packs and is always ready. */
const isSetupPlayable = (state: RoomState): boolean => {
  if (state.selectedGameId === null) return false;
  return state.gameSetup.game === 'STOP'
    ? state.gameSetup.categories.length >= MIN_CATEGORIES
    : true;
};

const answerQuiz = (state: RoomState, answer: QuizAnswer): RoomState => {
  const round = state.currentRound;
  if (state.status !== 'PLAYING' || round?.game !== 'QUIZ') return state;
  // First answer stands: nobody changes their mind after seeing a reaction.
  if (round.answers.some((entry) => entry.playerId === answer.playerId)) return state;

  return { ...state, currentRound: { ...round, answers: [...round.answers, answer] } };
};

/**
 * STOP hands the round to the Host to judge. QUIZ has nothing to judge, so it
 * scores itself on the spot and everyone lands straight on the scoreboard.
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

  const earned = computeQuizScores(round);
  const scores = { ...state.scores };
  for (const [playerId, points] of Object.entries(earned)) {
    scores[playerId] = (scores[playerId] ?? 0) + points;
  }

  return {
    ...state,
    status: 'CALCULATING_SCORES',
    scores,
    lastRoundPoints: earned,
    currentRound: { ...round, isScored: true },
  };
};

/** Order matters: categories appear in the round exactly as the Host picked them. */
const toggleCategory = (state: RoomState, category: string): RoomState => {
  if (state.gameSetup.game !== 'STOP') return state;
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

const releaseSlot = (state: RoomState, playerId: string): RoomState => {
  const slots = state.slots.map((slot) => (slot?.id === playerId ? null : slot));
  return { ...state, slots };
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
      return state.status === 'CONFIGURING_GAME' && state.gameSetup.game === 'STOP'
        ? toggleCategory(state, event.category)
        : state;

    case 'QUIZ_TOPIC_SELECTED':
      return state.status === 'CONFIGURING_GAME' && state.gameSetup.game === 'QUIZ'
        ? { ...state, gameSetup: { ...state.gameSetup, topic: event.topic } }
        : state;

    case 'QUIZ_ANSWERED':
      return answerQuiz(state, event.answer);

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

    case 'END_ROUND':
      return state.status === 'PLAYING' ? endRound(state) : state;

    case 'RETURN_TO_LOBBY':
      return state.status === 'CALCULATING_SCORES'
        ? { ...state, status: 'LOBBY_IDLE', selectedGameId: null, currentRound: null }
        : state;

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
