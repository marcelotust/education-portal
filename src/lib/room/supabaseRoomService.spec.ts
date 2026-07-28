import { describe, expect, it } from 'vitest';

import { makePlayer, makeRoom } from '@/test/factories';
import { toPersistedState } from './roomMapper';
import { createSupabaseRoomService } from './supabaseRoomService';
import { MAX_PLAYERS, type RoomState } from '@/types';
import type { RoomRow } from '@/types/database';
import type { EduPartyClient } from '../supabase';
import { RoomJoinError } from '@/types/roomService';

const toRow = (state: RoomState): RoomRow => ({
  id: 'room-1',
  pin: state.pin,
  host_id: state.hostId,
  is_open: true,
  created_at: '2026-07-27T12:00:00.000Z',
  updated_at: '2026-07-27T12:00:00.000Z',
  state: toPersistedState(state),
});

/**
 * Just enough of the client for `joinRoom`: an already-signed-in identity and a
 * single `rooms` row reachable through the query chain the service builds.
 */
const fakeClient = (uid: string, row: RoomRow | null): EduPartyClient => {
  const result = Promise.resolve({ data: row, error: null });
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: () => result,
  };

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: uid } } } }),
    },
    from: () => chain,
  } as unknown as EduPartyClient;
};

describe('joinRoom', () => {
  it('seats a newcomer as a client', async () => {
    const room = makeRoom({ playerCount: 2 });
    const service = createSupabaseRoomService(fakeClient('newcomer', toRow(room)));

    const session = await service.joinRoom('ABCD', 'ANA');

    expect(session.role).toBe('PLAYER');
    expect(session.nickname).toBe('ANA');
  });

  it('still refuses a stranger when every seat is taken', async () => {
    const room = makeRoom({ playerCount: MAX_PLAYERS });
    const service = createSupabaseRoomService(fakeClient('newcomer', toRow(room)));

    await expect(service.joinRoom('ABCD', 'ANA')).rejects.toMatchObject({ reason: 'ROOM_FULL' });
  });

  it('tells the student when there is no such room', async () => {
    const service = createSupabaseRoomService(fakeClient('newcomer', null));

    await expect(service.joinRoom('ZZZZ', 'ANA')).rejects.toBeInstanceOf(RoomJoinError);
  });

  // The Host's own browser opening /play is the same identity, not a seventh
  // player. Turning it away would lock a teacher out of the class it is running.
  it('walks the Host back into its own room instead of seating a phantom client', async () => {
    const room = makeRoom({ playerCount: 2 });
    const host = { ...makePlayer(0, { role: 'HOST' }), id: room.hostId, nickname: 'TEACHER' };
    const hosted: RoomState = {
      ...room,
      slots: room.slots.map((slot, index) => (index === 0 ? host : slot)),
    };
    const service = createSupabaseRoomService(fakeClient(room.hostId, toRow(hosted)));

    const session = await service.joinRoom('ABCD', 'WHATEVER');

    expect(session.role).toBe('HOST');
    expect(session.playerId).toBe(room.hostId);
    // Its seat already has a name; typing a new one must not rename the Host.
    expect(session.nickname).toBe('TEACHER');
  });

  it('lets a Host back in even when the board is full', async () => {
    const room = makeRoom({ playerCount: MAX_PLAYERS });
    const hosted: RoomState = {
      ...room,
      slots: room.slots.map((slot, index) =>
        index === 0 && slot !== null ? { ...slot, id: room.hostId } : slot,
      ),
    };
    const service = createSupabaseRoomService(fakeClient(room.hostId, toRow(hosted)));

    await expect(service.joinRoom('ABCD', 'TEACHER')).resolves.toMatchObject({ role: 'HOST' });
  });

  // Slots are persisted, so a seated student counts against MAX_PLAYERS. A
  // refresh must reclaim that seat rather than bounce off a room it is in.
  it('lets a seated student back into a full room', async () => {
    const room = makeRoom({ playerCount: MAX_PLAYERS });
    const seated = room.slots[3];
    if (seated === null || seated === undefined) throw new Error('expected a seated player');
    const service = createSupabaseRoomService(fakeClient(seated.id, toRow(room)));

    const session = await service.joinRoom('ABCD', 'ANA');

    expect(session.role).toBe('PLAYER');
    expect(session.playerId).toBe(seated.id);
  });

  it('keeps the name a returning student types', async () => {
    const room = makeRoom({ playerCount: 3 });
    const seated = room.slots[1];
    if (seated === null || seated === undefined) throw new Error('expected a seated player');
    const service = createSupabaseRoomService(fakeClient(seated.id, toRow(room)));

    const session = await service.joinRoom('ABCD', 'NEWNAME');

    expect(session.nickname).toBe('NEWNAME');
  });
});
