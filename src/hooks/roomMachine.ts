import { MAX_PLAYERS, type RoomEvent, type RoomEventType, type RoomState } from '@/types';

/** Presence events are broadcast by the infrastructure, not by the Host. */
const PRESENCE_EVENTS: readonly RoomEventType[] = ['PLAYER_JOINED', 'PLAYER_LEFT'];

export const isHostOnlyEvent = (event: RoomEvent): boolean => !PRESENCE_EVENTS.includes(event.type);

const seatPlayer = (state: RoomState, event: Extract<RoomEvent, { type: 'PLAYER_JOINED' }>) => {
  const openSlot = state.slots.findIndex((slot) => slot === null);
  if (openSlot === -1 || state.slots.length > MAX_PLAYERS) return state;

  const slots = state.slots.map((slot, index) => (index === openSlot ? event.player : slot));
  return { ...state, slots };
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

    case 'START_GAME':
      return state.status === 'CONFIGURING_GAME' && state.selectedGameId !== null
        ? { ...state, status: 'PLAYING_AD' }
        : state;

    case 'AD_FINISHED':
      return state.status === 'PLAYING_AD' ? { ...state, status: 'PLAYING' } : state;

    case 'END_ROUND':
      return state.status === 'PLAYING' ? { ...state, status: 'CALCULATING_SCORES' } : state;

    case 'RETURN_TO_LOBBY':
      return state.status === 'CALCULATING_SCORES'
        ? { ...state, status: 'LOBBY_IDLE', selectedGameId: null, currentRound: null }
        : state;

    case 'PLAYER_JOINED':
      return seatPlayer(state, event);

    case 'PLAYER_LEFT':
      return releaseSlot(state, event.playerId);
  }
};
