import { describe, expect, it } from 'vitest';

import { makePlayer } from '@/test/factories';
import type { PlayerSlot } from '@/types';
import { hasEnoughPlayers, isAlone, playsAlone } from './canStart';

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

describe('playsAlone', () => {
  it('lets STOP play with nothing, with or without a bot', () => {
    expect(playsAlone('STOP', false)).toBe(true);
    expect(playsAlone('STOP', true)).toBe(true);
  });

  it('lets QUIZ play only once there is a bot', () => {
    expect(playsAlone('QUIZ', false)).toBe(false);
    expect(playsAlone('QUIZ', true)).toBe(true);
  });

  it('never lets TABOO play without a real Player, bot or not', () => {
    expect(playsAlone('TABOO', false)).toBe(false);
    expect(playsAlone('TABOO', true)).toBe(false);
  });
});

describe('hasEnoughPlayers', () => {
  it('lets the Host start STOP with nobody else in the room', () => {
    expect(hasEnoughPlayers('STOP', hostOnly, false)).toBe(true);
  });

  it('keeps QUIZ and TABOO waiting for a real Player', () => {
    expect(hasEnoughPlayers('QUIZ', hostOnly, false)).toBe(false);
    expect(hasEnoughPlayers('TABOO', hostOnly, false)).toBe(false);
  });

  it('lets QUIZ start against the bot, but not TABOO', () => {
    expect(hasEnoughPlayers('QUIZ', hostOnly, true)).toBe(true);
    expect(hasEnoughPlayers('TABOO', hostOnly, true)).toBe(false);
  });

  it.each(['STOP', 'QUIZ', 'TABOO'] as const)(
    'lets any cartridge start once a Player is seated: %s',
    (gameId) => {
      expect(hasEnoughPlayers(gameId, hostAndPlayer, false)).toBe(true);
    },
  );
});
