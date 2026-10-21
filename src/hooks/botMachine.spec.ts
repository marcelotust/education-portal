import { describe, expect, it } from 'vitest';

import { makeBotPlayer, makeRoom } from '@/test/factories';
import { isHostOnlyEvent, roomReducer } from './roomMachine';

describe('adding and removing the bot (#155)', () => {
  it('seats a bot while the Host is in the lobby', () => {
    const next = roomReducer(makeRoom({ playerCount: 1 }), { type: 'ADD_BOT' });

    expect(next.bot).toMatchObject({ id: 'bot:1', isBot: true, role: 'PLAYER' });
  });

  it('seats a bot while the Host is choosing a game', () => {
    const next = roomReducer(makeRoom({ playerCount: 1, status: 'CONFIGURING_GAME' }), {
      type: 'ADD_BOT',
    });

    expect(next.bot).not.toBeNull();
  });

  it('allows at most one bot', () => {
    const room = makeRoom({ playerCount: 1, bot: makeBotPlayer() });

    expect(roomReducer(room, { type: 'ADD_BOT' })).toBe(room);
  });

  it('refuses a bot once six real people hold the seats', () => {
    const room = makeRoom({ playerCount: 6 });

    expect(roomReducer(room, { type: 'ADD_BOT' })).toBe(room);
  });

  it('refuses a bot in the middle of a round', () => {
    const room = makeRoom({ playerCount: 1, status: 'PLAYING' });

    expect(roomReducer(room, { type: 'ADD_BOT' })).toBe(room);
  });

  it('removes the bot from the lobby', () => {
    const room = makeRoom({ playerCount: 1, bot: makeBotPlayer() });

    expect(roomReducer(room, { type: 'REMOVE_BOT' }).bot).toBeNull();
  });

  it('ignores a removal when there is no bot', () => {
    const room = makeRoom({ playerCount: 1 });

    expect(roomReducer(room, { type: 'REMOVE_BOT' })).toBe(room);
  });

  it('keeps both control events Host-only', () => {
    expect(isHostOnlyEvent({ type: 'ADD_BOT' })).toBe(true);
    expect(isHostOnlyEvent({ type: 'REMOVE_BOT' })).toBe(true);
  });
});

describe('the bot and the presence board (#155)', () => {
  it('survives a presence sync, which rewrites every real seat', () => {
    const room = makeRoom({ playerCount: 2, bot: makeBotPlayer() });
    const synced = roomReducer(room, { type: 'PLAYERS_SYNCED', slots: room.slots.slice(0, 1) });

    expect(synced.bot).not.toBeNull();
  });

  it('gives the seat to a real Player once the board would overflow', () => {
    const withBot = makeRoom({ playerCount: 5, bot: makeBotPlayer() });
    const full = makeRoom({ playerCount: 6 });

    const next = roomReducer(withBot, { type: 'PLAYERS_SYNCED', slots: full.slots });

    expect(next.bot).toBeNull();
    expect(next.slots.filter((slot) => slot !== null)).toHaveLength(6);
  });

  it('lets five people and the bot share the six seats', () => {
    const room = makeRoom({ playerCount: 5, bot: makeBotPlayer() });

    expect(roomReducer(room, { type: 'PLAYERS_SYNCED', slots: room.slots })).toBe(room);
  });

  it('takes the bot from the row on a Player, who never adds one', () => {
    const player = makeRoom({ playerCount: 2 });
    const {
      pin: _pin,
      hostId: _hostId,
      ...persisted
    } = makeRoom({
      playerCount: 2,
      bot: makeBotPlayer(),
    });

    expect(roomReducer(player, { type: 'ROOM_STATE_RECEIVED', state: persisted }).bot).toEqual(
      makeBotPlayer(),
    );
  });
});
