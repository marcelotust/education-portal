import { describe, expect, it } from 'vitest';

import { makePlayer } from '@/test/factories';
import type { PlayerSlot } from '@/types';
import { hasEnoughPlayers, isAlone } from './canStart';

const hostOnly: PlayerSlot[] = [makePlayer(0, { role: 'HOST' }), null, null, null, null, null];
const hostAndPlayer: PlayerSlot[] = [
  makePlayer(0, { role: 'HOST' }),
  makePlayer(1),
  null,
  null,
  null,
  null,
];

describe('isAlone', () => {
  it('is true while the Host is the only one seated', () => {
    expect(isAlone(hostOnly)).toBe(true);
  });

  it('is false once a Player is seated', () => {
    expect(isAlone(hostAndPlayer)).toBe(false);
  });
});

describe('hasEnoughPlayers', () => {
  it('lets the Host start STOP with nobody else in the room', () => {
    expect(hasEnoughPlayers('STOP', hostOnly)).toBe(true);
  });

  it('keeps QUIZ and TABOO waiting for a real Player', () => {
    expect(hasEnoughPlayers('QUIZ', hostOnly)).toBe(false);
    expect(hasEnoughPlayers('TABOO', hostOnly)).toBe(false);
  });

  it.each(['STOP', 'QUIZ', 'TABOO'] as const)(
    'lets any cartridge start once a Player is seated: %s',
    (gameId) => {
      expect(hasEnoughPlayers(gameId, hostAndPlayer)).toBe(true);
    },
  );
});
