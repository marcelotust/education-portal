import { beforeEach, describe, expect, it } from 'vitest';

import { RECENT_ROOMS_LIMIT, listRecentRooms, rememberRoom } from './recentRooms';

describe('recently joined rooms', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

  it('remembers a room the student joined', () => {
    const joinedAt = minutesAgo(1);
    rememberRoom({ pin: 'KPZT', nickname: 'ANA', joinedAt });

    expect(listRecentRooms()).toEqual([{ pin: 'KPZT', nickname: 'ANA', joinedAt }]);
  });

  it('puts the most recent room first', () => {
    rememberRoom({ pin: 'AAAA', nickname: 'ANA', joinedAt: minutesAgo(60) });
    rememberRoom({ pin: 'BBBB', nickname: 'ANA', joinedAt: minutesAgo(10) });

    expect(listRecentRooms().map((room) => room.pin)).toEqual(['BBBB', 'AAAA']);
  });

  it('keeps one entry per room, refreshed', () => {
    rememberRoom({ pin: 'KPZT', nickname: 'ANA', joinedAt: minutesAgo(60) });
    rememberRoom({ pin: 'KPZT', nickname: 'ANINHA', joinedAt: minutesAgo(5) });

    const rooms = listRecentRooms();
    expect(rooms).toHaveLength(1);
    expect(rooms[0]?.nickname).toBe('ANINHA');
  });

  it('does not grow without bound', () => {
    for (let index = 0; index < RECENT_ROOMS_LIMIT + 3; index += 1) {
      rememberRoom({
        pin: `PIN${index}`,
        nickname: 'ANA',
        joinedAt: minutesAgo(RECENT_ROOMS_LIMIT + 3 - index),
      });
    }

    expect(listRecentRooms()).toHaveLength(RECENT_ROOMS_LIMIT);
  });

  it('hides rooms too old to still exist', () => {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    rememberRoom({ pin: 'DEAD', nickname: 'ANA', joinedAt: sixHoursAgo });
    rememberRoom({ pin: 'LIVE', nickname: 'ANA', joinedAt: new Date().toISOString() });

    expect(listRecentRooms().map((room) => room.pin)).toEqual(['LIVE']);
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
