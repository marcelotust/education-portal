import { beforeEach, describe, expect, it } from 'vitest';

import { RECENT_ROOMS_LIMIT, listRecentRooms, rememberRoom } from './recentRooms';

describe('recently joined rooms', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('remembers a room the student joined', () => {
    rememberRoom({ pin: 'KPZT', nickname: 'ANA', joinedAt: '2026-07-25T10:00:00.000Z' });

    expect(listRecentRooms()).toEqual([
      { pin: 'KPZT', nickname: 'ANA', joinedAt: '2026-07-25T10:00:00.000Z' },
    ]);
  });

  it('puts the most recent room first', () => {
    rememberRoom({ pin: 'AAAA', nickname: 'ANA', joinedAt: '2026-07-25T10:00:00.000Z' });
    rememberRoom({ pin: 'BBBB', nickname: 'ANA', joinedAt: '2026-07-25T11:00:00.000Z' });

    expect(listRecentRooms().map((room) => room.pin)).toEqual(['BBBB', 'AAAA']);
  });

  it('keeps one entry per room, refreshed', () => {
    rememberRoom({ pin: 'KPZT', nickname: 'ANA', joinedAt: '2026-07-25T10:00:00.000Z' });
    rememberRoom({ pin: 'KPZT', nickname: 'ANINHA', joinedAt: '2026-07-25T12:00:00.000Z' });

    const rooms = listRecentRooms();
    expect(rooms).toHaveLength(1);
    expect(rooms[0]?.nickname).toBe('ANINHA');
  });

  it('does not grow without bound', () => {
    for (let index = 0; index < RECENT_ROOMS_LIMIT + 3; index += 1) {
      rememberRoom({
        pin: `PIN${index}`,
        nickname: 'ANA',
        joinedAt: new Date(2026, 0, 1, index).toISOString(),
      });
    }

    expect(listRecentRooms()).toHaveLength(RECENT_ROOMS_LIMIT);
  });

  it('survives storage holding something that is not a room list', () => {
    localStorage.setItem('eduparty.recent-rooms', 'not json at all');

    expect(listRecentRooms()).toEqual([]);
  });

  it('drops entries that lost their shape', () => {
    localStorage.setItem('eduparty.recent-rooms', JSON.stringify([{ nickname: 'ANA' }, 42]));

    expect(listRecentRooms()).toEqual([]);
  });
});
