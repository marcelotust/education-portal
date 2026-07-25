import type { StopRound } from '@/types';

/** Fixed category set for the MVP. */
export const STOP_CATEGORIES: readonly string[] = [
  'NAME',
  'ANIMAL',
  'FOOD',
  'COUNTRY',
  'OBJECT',
  'COLOR',
];

/** Letters that actually give students a fair chance in every category. */
const LETTERS = 'ABCDEFGHIJLMNOPRSTUV';

export const drawLetter = (): string => LETTERS[Math.floor(Math.random() * LETTERS.length)] ?? 'A';

export const createStopRound = (durationSeconds: number, now = new Date()): StopRound => ({
  phase: 'TYPING_PHASE',
  letter: drawLetter(),
  categories: STOP_CATEGORIES,
  answers: [],
  endsAt: new Date(now.getTime() + durationSeconds * 1000).toISOString(),
});

/** Whole seconds left, floored at zero; drives the on-screen clock. */
export const secondsUntil = (endsAt: string | null, now = Date.now()): number => {
  if (endsAt === null) return 0;
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
};
