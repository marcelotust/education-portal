import type { GameCartridge } from '@/types';

/** Cartridge catalog available to the Host. */
export const GAME_CARTRIDGES: readonly GameCartridge[] = [
  {
    id: 'STOP',
    title: 'STOP',
    tagline: 'Categories against the clock',
    spritePosition: '100% 0%',
    roundDurationSeconds: 60,
  },
  {
    id: 'QUIZ',
    title: 'QUIZ',
    tagline: 'Multiple choice, fastest wins',
    spritePosition: '100% 100%',
    roundDurationSeconds: 30,
  },
  {
    id: 'TABOO',
    title: 'TABOO',
    tagline: 'Say anything but the word',
    spritePosition: '0% 100%',
    roundDurationSeconds: 120,
  },
];

/**
 * The showcase grid's fourth slot: no cartridge behind it yet, just the
 * spritesheet's "loading" quadrant standing in for games still to come.
 */
export const LOADING_CARD = {
  title: 'LOADING',
  tagline: 'More games on the way',
  spritePosition: '0% 0%',
} as const;
