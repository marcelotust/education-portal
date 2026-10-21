import { describe, expect, it } from 'vitest';

import { makeBotPlayer, makeRoom } from '@/test/factories';
import { seatedBoard, seatedCount, seatedPlayers } from './room';

describe('seats with a bot', () => {
  it('counts only the people in the slots when there is no bot', () => {
    const room = makeRoom({ playerCount: 2 });

    expect(seatedCount(room)).toBe(2);
    expect(seatedPlayers(room)).toHaveLength(2);
  });

  it('adds the bot to the people who are seated', () => {
    const room = makeRoom({ playerCount: 2, bot: makeBotPlayer() });

    expect(seatedCount(room)).toBe(3);
    expect(seatedPlayers(room).map((player) => player.id)).toEqual([
      'player-0',
      'player-1',
      'bot:1',
    ]);
  });

  it('puts the bot on the first open seat of the board', () => {
    const board = seatedBoard(makeRoom({ playerCount: 2, bot: makeBotPlayer() }));

    expect(board).toHaveLength(6);
    expect(board[2]?.id).toBe('bot:1');
    expect(board[3]).toBeNull();
  });

  it('leaves the board as the slots when there is no bot', () => {
    const room = makeRoom({ playerCount: 2 });

    expect(seatedBoard(room)).toEqual(room.slots);
  });
});
