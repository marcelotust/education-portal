import type { GameCartridge } from '@/types';

/** Cartridge catalog available to the Host. */
export const GAME_CARTRIDGES: readonly GameCartridge[] = [
  {
    id: 'STOP',
    title: 'STOP',
    tagline: 'Categories against the clock',
    roundDurationSeconds: 60,
  },
  {
    id: 'QUIZ',
    title: 'QUIZ',
    tagline: 'Multiple choice, fastest wins',
    roundDurationSeconds: 30,
  },
  {
    id: 'TABOO',
    title: 'TABOO',
    tagline: 'Say anything but the word',
    roundDurationSeconds: 120,
  },
];
