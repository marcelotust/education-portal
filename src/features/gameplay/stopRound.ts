import type { StopRound, StopSetup } from '@/types';

/** Everything the Host can pick from when setting up a match. */
export const STOP_CATEGORY_CATALOG: readonly string[] = [
  'NAME',
  'ANIMAL',
  'FOOD',
  'COUNTRY',
  'CITY',
  'OBJECT',
  'COLOR',
  'PROFESSION',
  'BRAND',
  'MOVIE',
  'SPORT',
  'BODY PART',
];

/** A fresh room is playable without touching the setup. */
export const DEFAULT_STOP_SETUP: StopSetup = {
  roundDurationSeconds: 60,
  categories: ['NAME', 'ANIMAL', 'FOOD', 'COUNTRY'],
};

/** The room stores the setup tagged with its cartridge. */
export const DEFAULT_STOP_GAME_SETUP = { game: 'STOP', ...DEFAULT_STOP_SETUP } as const;

/** Letters that actually give Players a fair chance in every category. */
const LETTERS = 'ABCDEFGHIJLMNOPRSTUV';

export const drawLetter = (): string => LETTERS[Math.floor(Math.random() * LETTERS.length)] ?? 'A';

export const createStopRound = (setup: StopSetup, now = new Date()): StopRound => ({
  game: 'STOP',
  phase: 'TYPING_PHASE',
  letter: drawLetter(),
  categories: setup.categories,
  answers: [],
  stoppedBy: null,
  isScored: false,
  endsAt: new Date(now.getTime() + setup.roundDurationSeconds * 1000).toISOString(),
});

/** Whole seconds left, floored at zero; drives the on-screen clock. */
export const secondsUntil = (endsAt: string | null, now = Date.now()): number => {
  if (endsAt === null) return 0;
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
};
