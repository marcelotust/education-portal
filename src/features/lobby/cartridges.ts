import type { GameCartridge } from '@/types';

/** Cartridge catalog available to the Host. Only STOP ships in the MVP. */
export const GAME_CARTRIDGES: readonly GameCartridge[] = [
  {
    id: 'STOP',
    title: 'STOP',
    tagline: 'Categories against the clock',
    roundDurationSeconds: 60,
  },
];
