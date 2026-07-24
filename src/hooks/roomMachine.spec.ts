import { describe, expect, it } from 'vitest';

import { makePlayer, makeRoom } from '@/test/factories';
import { isHostOnlyEvent, roomReducer } from './roomMachine';
import type { RoomState } from '@/types';

const withStatus = (status: RoomState['status']): RoomState => makeRoom({ status });

describe('room FSM', () => {
  it('walks the happy path LOBBY_IDLE -> ... -> CALCULATING_SCORES -> LOBBY_IDLE', () => {
    let state = roomReducer(withStatus('LOBBY_IDLE'), { type: 'OPEN_GAME_CONFIG' });
    expect(state.status).toBe('CONFIGURING_GAME');

    state = roomReducer(state, { type: 'SELECT_GAME', gameId: 'STOP' });
    expect(state.selectedGameId).toBe('STOP');

    state = roomReducer(state, { type: 'START_GAME' });
    expect(state.status).toBe('PLAYING_AD');

    state = roomReducer(state, { type: 'AD_FINISHED' });
    expect(state.status).toBe('PLAYING');

    state = roomReducer(state, { type: 'END_ROUND' });
    expect(state.status).toBe('CALCULATING_SCORES');

    state = roomReducer(state, { type: 'RETURN_TO_LOBBY' });
    expect(state.status).toBe('LOBBY_IDLE');
    expect(state.selectedGameId).toBeNull();
  });

  it('ignores events that are not valid for the current state', () => {
    const idle = withStatus('LOBBY_IDLE');

    expect(roomReducer(idle, { type: 'AD_FINISHED' })).toBe(idle);
    expect(roomReducer(idle, { type: 'END_ROUND' })).toBe(idle);
  });

  it('refuses to start a game while no cartridge is selected', () => {
    const configuring = withStatus('CONFIGURING_GAME');

    expect(roomReducer(configuring, { type: 'START_GAME' })).toBe(configuring);
  });

  it('seats a joining player in the first open slot', () => {
    const room = makeRoom({ playerCount: 1 });

    const next = roomReducer(room, { type: 'PLAYER_JOINED', player: makePlayer(5) });

    expect(next.slots[1]?.id).toBe('player-5');
  });

  it('rejects a 7th player because the room holds 6 seats', () => {
    const full = makeRoom({ playerCount: 6 });

    expect(roomReducer(full, { type: 'PLAYER_JOINED', player: makePlayer(9) })).toBe(full);
  });

  it('frees the slot of a player that left', () => {
    const room = makeRoom({ playerCount: 3 });

    const next = roomReducer(room, { type: 'PLAYER_LEFT', playerId: 'player-1' });

    expect(next.slots[1]).toBeNull();
    expect(next.slots[0]?.id).toBe('player-0');
  });

  it('classifies flow-control events as Host-only and presence events as shared', () => {
    expect(isHostOnlyEvent({ type: 'START_GAME' })).toBe(true);
    expect(isHostOnlyEvent({ type: 'OPEN_GAME_CONFIG' })).toBe(true);
    expect(isHostOnlyEvent({ type: 'PLAYER_LEFT', playerId: 'player-1' })).toBe(false);
  });
});
