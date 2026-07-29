import { describe, expect, it } from 'vitest';

import { buildSlotsFromPresence, type PresencePayload } from './presence';

const presence = (id: string, nickname: string, joinedAt: string): PresencePayload => ({
  playerId: id,
  nickname,
  role: 'PLAYER',
  joinedAt,
});

const HOST_ID = 'host-1';
const host: PresencePayload = {
  playerId: HOST_ID,
  nickname: 'HOST',
  role: 'HOST',
  joinedAt: '2026-07-24T12:05:00.000Z',
};

describe('presence to board', () => {
  it('always returns the fixed 6-slot board', () => {
    expect(buildSlotsFromPresence([host], HOST_ID)).toHaveLength(6);
  });

  it('seats the Host first even when a Player connected earlier', () => {
    const early = presence('player-2', 'ANA', '2026-07-24T12:00:00.000Z');

    const slots = buildSlotsFromPresence([early, host], HOST_ID);

    expect(slots[0]?.nickname).toBe('HOST');
    expect(slots[1]?.nickname).toBe('ANA');
  });

  it('orders Players by join time so seats do not jump around', () => {
    const second = presence('player-2', 'BRUNO', '2026-07-24T12:10:00.000Z');
    const first = presence('player-3', 'ANA', '2026-07-24T12:06:00.000Z');

    const slots = buildSlotsFromPresence([second, first, host], HOST_ID);

    expect(slots.map((slot) => slot?.nickname)).toEqual([
      'HOST',
      'ANA',
      'BRUNO',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('collapses the same player joining from two tabs into one seat', () => {
    const one = presence('player-2', 'ANA', '2026-07-24T12:06:00.000Z');
    const sameAgain = presence('player-2', 'ANA', '2026-07-24T12:07:00.000Z');

    const slots = buildSlotsFromPresence([one, sameAgain, host], HOST_ID);

    expect(slots.filter((slot) => slot !== null)).toHaveLength(2);
  });

  it('ignores anyone beyond the 6th seat instead of overflowing the board', () => {
    const crowd = Array.from({ length: 9 }, (_, index) =>
      presence(`player-${index}`, `P${index}`, `2026-07-24T12:0${index}:00.000Z`),
    );

    const slots = buildSlotsFromPresence([...crowd, host], HOST_ID);

    expect(slots.filter((slot) => slot !== null)).toHaveLength(6);
    expect(slots[0]?.nickname).toBe('HOST');
  });

  it('marks the Host role from the room, not from what the client claims', () => {
    const liar: PresencePayload = {
      ...presence('player-2', 'ANA', '2026-07-24T12:06:00.000Z'),
      role: 'HOST',
    };

    const slots = buildSlotsFromPresence([liar, host], HOST_ID);

    expect(slots.find((slot) => slot?.nickname === 'ANA')?.role).toBe('PLAYER');
    expect(slots.find((slot) => slot?.nickname === 'HOST')?.role).toBe('HOST');
  });
});
