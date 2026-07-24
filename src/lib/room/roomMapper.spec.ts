import { describe, expect, it } from 'vitest';

import { makePlayer } from '@/test/factories';
import type { RoomRow } from '@/types/database';
import { rowToRoomState, toPersistedState } from './roomMapper';

const makeRow = (state: Partial<RoomRow['state']> = {}): RoomRow => ({
  id: 'room-1',
  pin: 'KPZT',
  host_id: 'host-1',
  state: {
    status: 'LOBBY_IDLE',
    slots: [null, null, null, null, null, null],
    selectedGameId: null,
    currentRound: null,
    ...state,
  },
  is_open: true,
  created_at: '2026-07-24T12:00:00.000Z',
  updated_at: '2026-07-24T12:00:00.000Z',
});

describe('room mapper', () => {
  it('lifts the PIN and host columns into the in-memory RoomState', () => {
    const state = rowToRoomState(makeRow({ status: 'PLAYING' }));

    expect(state.pin).toBe('KPZT');
    expect(state.hostId).toBe('host-1');
    expect(state.status).toBe('PLAYING');
  });

  it('always yields exactly 6 slots even when the row holds fewer', () => {
    const state = rowToRoomState(makeRow({ slots: [makePlayer(0)] }));

    expect(state.slots).toHaveLength(6);
    expect(state.slots[0]?.id).toBe('player-0');
    expect(state.slots[5]).toBeNull();
  });

  it('drops extra seats so a malformed row cannot overflow the board', () => {
    const seven = Array.from({ length: 7 }, (_, index) => makePlayer(index));

    expect(rowToRoomState(makeRow({ slots: seven })).slots).toHaveLength(6);
  });

  it('falls back to LOBBY_IDLE when the stored status is not a known state', () => {
    const row = makeRow();
    // Simulates a row written by an older/newer client.
    const corrupted = { ...row, state: { ...row.state, status: 'WAT' as never } };

    expect(rowToRoomState(corrupted).status).toBe('LOBBY_IDLE');
  });

  it('strips the columns that must not be duplicated inside the JSONB payload', () => {
    const payload = toPersistedState(rowToRoomState(makeRow()));

    expect(payload).not.toHaveProperty('pin');
    expect(payload).not.toHaveProperty('hostId');
    expect(payload.status).toBe('LOBBY_IDLE');
  });

  it('round-trips a state through the payload without losing the board', () => {
    const original = rowToRoomState(makeRow({ slots: [makePlayer(0), makePlayer(1)] }));

    const roundTripped = rowToRoomState({ ...makeRow(), state: toPersistedState(original) });

    expect(roundTripped.slots).toEqual(original.slots);
  });
});
