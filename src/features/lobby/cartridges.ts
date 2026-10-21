import type { GameCartridge, GameId } from '@/types';

/** Cartridge catalog available to the Host. */
export const GAME_CARTRIDGES: readonly GameCartridge[] = [
  {
    id: 'STOP',
    title: 'STOP',
    tagline: 'Categories against the clock',
    spritePosition: '100% 0%',
    roundDurationSeconds: 60,
    playsWithout: 'NOTHING',
  },
  {
    id: 'QUIZ',
    title: 'QUIZ',
    tagline: 'Multiple choice, fastest wins',
    spritePosition: '100% 100%',
    roundDurationSeconds: 30,
    playsWithout: 'PLAYERS',
  },
  {
    id: 'TABOO',
    title: 'TABOO',
    tagline: 'Say anything but the word',
    spritePosition: '0% 100%',
    roundDurationSeconds: 120,
    playsWithout: 'PLAYERS',
  },
];

/** Looks up a cartridge's own art/copy by its game ID — used wherever a game guide (#149) needs the same sprite the picker shows. */
export const cartridgeFor = (gameId: GameId): GameCartridge => {
  const cartridge = GAME_CARTRIDGES.find((entry) => entry.id === gameId);
  // Every GameId has a matching cartridge by construction — the catalog above.
  if (cartridge === undefined) throw new Error(`No cartridge registered for ${gameId}`);
  return cartridge;
};

/**
 * The showcase grid's fourth slot: no cartridge behind it yet, just the
 * spritesheet's "loading" quadrant standing in for games still to come.
 */
export const LOADING_CARD = {
  title: 'LOADING',
  tagline: 'More games on the way',
  spritePosition: '0% 0%',
} as const;
