import { computeRoundScores } from '@/features/gameplay/scoring';
import {
  MAX_PLAYERS,
  MIN_CATEGORIES,
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
  if (state.currentRound === null) return state;

  const others = state.currentRound.answers.filter((answer) => answer.playerId !== event.playerId);
  return {
    ...state,
    currentRound: { ...state.currentRound, answers: [...others, ...event.answers] },
  };
};

/** Order matters: categories appear in the round exactly as the Host picked them. */
const toggleCategory = (state: RoomState, category: string): RoomState => {
  const { categories } = state.gameSetup;
  const next = categories.includes(category)
    ? categories.filter((entry) => entry !== category)
    : [...categories, category];

  return { ...state, gameSetup: { ...state.gameSetup, categories: next } };
};

const judgeAnswer = (
  state: RoomState,
  event: Extract<RoomEvent, { type: 'ANSWER_JUDGED' }>,
): RoomState => {
  if (state.currentRound === null) return state;

  const answers = state.currentRound.answers.map((answer) =>
    answer.playerId === event.playerId && answer.category === event.category
      ? { ...answer, isValid: event.isValid }
      : answer,
  );

  return { ...state, currentRound: { ...state.currentRound, answers } };
};

/**
 * Judging every answer one by one is the honest default, but eight categories
 * across six players is forty-eight taps. This accepts everything still
 * pending, leaving whatever the Host already rejected untouched.
 */
const approveRemaining = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (round === null) return state;

  const answers = round.answers.map((answer) =>
    answer.isValid === null ? { ...answer, isValid: true } : answer,
  );

  return { ...state, currentRound: { ...round, answers } };
};

/** Points are added to the running total, never replacing earlier rounds. */
const scoreRound = (state: RoomState): RoomState => {
  const round = state.currentRound;
  if (round === null || round.isScored) return state;

  const seated = state.slots.filter((slot) => slot !== null).map((slot) => slot.id);
  const earned = computeRoundScores(round, seated);

  const scores = { ...state.scores };
  for (const [playerId, points] of Object.entries(earned)) {
    scores[playerId] = (scores[playerId] ?? 0) + points;
  }

  return { ...state, scores, currentRound: { ...round, isScored: true } };
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
      return state.status === 'CONFIGURING_GAME'
        ? { ...state, selectedGameId: event.gameId }
        : state;

    case 'ROUND_DURATION_SELECTED':
      return state.status === 'CONFIGURING_GAME'
        ? { ...state, gameSetup: { ...state.gameSetup, roundDurationSeconds: event.seconds } }
        : state;

    case 'CATEGORY_TOGGLED':
      return state.status === 'CONFIGURING_GAME' ? toggleCategory(state, event.category) : state;

    case 'START_GAME':
      // The four-category floor lives here too, not just in the disabled button.
      return state.status === 'CONFIGURING_GAME' &&
        state.selectedGameId !== null &&
        state.gameSetup.categories.length >= MIN_CATEGORIES
        ? { ...state, status: 'PLAYING_AD' }
        : state;

    case 'AD_FINISHED':
      return state.status === 'PLAYING_AD'
        ? { ...state, status: 'PLAYING', currentRound: event.round }
        : state;

    case 'ANSWERS_SUBMITTED':
      return submitAnswers(state, event);

    case 'ANSWER_JUDGED':
      return judgeAnswer(state, event);

    case 'REMAINING_ANSWERS_APPROVED':
      return approveRemaining(state);

    case 'ROUND_SCORED':
      return scoreRound(state);

    case 'END_ROUND':
      return state.status === 'PLAYING'
        ? {
            ...state,
            status: 'CALCULATING_SCORES',
            currentRound:
              state.currentRound === null
                ? null
                : { ...state.currentRound, phase: 'VALIDATION_PHASE' },
          }
        : state;

    case 'RETURN_TO_LOBBY':
      return state.status === 'CALCULATING_SCORES'
        ? { ...state, status: 'LOBBY_IDLE', selectedGameId: null, currentRound: null }
        : state;

    case 'PLAYER_JOINED':
      return seatPlayer(state, event);

    case 'PLAYER_LEFT':
      return releaseSlot(state, event.playerId);

    case 'ROOM_STATE_RECEIVED': {
      const { status, selectedGameId, currentRound, gameSetup, scores } = event.state;
      const unchanged =
        state.status === status &&
        state.selectedGameId === selectedGameId &&
        state.currentRound === currentRound &&
        state.gameSetup === gameSetup &&
        state.scores === scores;

      // Seats come from Presence; the row never overwrites the live board.
      return unchanged
        ? state
        : { ...state, status, selectedGameId, currentRound, gameSetup, scores };
    }

    case 'PLAYERS_SYNCED': {
      // Realtime Presence owns the board; it arrives already normalised to 6.
      const slots = Array.from({ length: MAX_PLAYERS }, (_, index) => event.slots[index] ?? null);
      return sameBoard(state.slots, slots) ? state : { ...state, slots };
    }
  }
};
