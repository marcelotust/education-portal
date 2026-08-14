import type { EduPartyClient } from '@/lib/supabase';
import type { TabooCard, TabooGuess, TabooRound, TabooSetup, TabooTurn } from '@/types';
import { fetchTabooCards } from './tabooContent';

/** Flat points for a correct guess; nobody is judged, so there is no bonus to argue about. */
export const TABOO_CORRECT_POINTS = 10;

export const TABOO_CATEGORY_CATALOG: readonly string[] = [
  'ANIMALS',
  'MOVIES',
  'SPORTS',
  'FOOD',
  'JOBS',
  'COUNTRIES',
];

/** A fresh room is playable without touching the setup. */
export const DEFAULT_TABOO_SETUP: TabooSetup = {
  roundDurationSeconds: 120,
  categories: ['ANIMALS', 'MOVIES', 'FOOD'],
};

const shuffled = <T>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
};

/**
 * Draws the whole match from an already-fetched deck, like QUIZ: one card per
 * seated player, so every screen agrees on who goes next. A thin deck or a
 * thin room caps the match short rather than repeating a card or a
 * clue-giver.
 */
export const drawTabooTurns = (
  cardPool: readonly TabooCard[],
  setup: TabooSetup,
  seatedPlayerIds: readonly string[],
  now: Date,
): TabooRound => {
  const cards = shuffled(cardPool);
  const clueGivers = shuffled(seatedPlayerIds);
  const turnCount = Math.min(clueGivers.length, cards.length);

  const turns: TabooTurn[] = clueGivers
    .slice(0, turnCount)
    .map((clueGiverId, index) => ({ clueGiverId, card: cards[index]! }));

  return {
    game: 'TABOO',
    turns,
    currentIndex: 0,
    guesses: [],
    turnPoints: {},
    matchPoints: {},
    endsAt: new Date(now.getTime() + setup.roundDurationSeconds * 1000).toISOString(),
    isScored: false,
  };
};

/**
 * Fetches the chosen categories' cards from `public.taboo_cards` (#34) and
 * draws the match from them. Correctness of the draw itself is covered by
 * `drawTabooTurns`, which this just wires up to the real content source.
 */
export const createTabooRound = async (
  setup: TabooSetup,
  seatedPlayerIds: readonly string[],
  now = new Date(),
  client?: EduPartyClient,
): Promise<TabooRound> => {
  const cardPool = await fetchTabooCards(setup.categories, client);
  return drawTabooTurns(cardPool, setup, seatedPlayerIds, now);
};

/** The turn on screen. `undefined` only if a round arrives malformed. */
export const currentTurn = (round: TabooRound): TabooTurn | undefined =>
  round.turns[round.currentIndex];

export const isLastTurn = (round: TabooRound): boolean =>
  round.currentIndex >= round.turns.length - 1;

/** Case, accent and whitespace should never be why a right guess scored nothing. */
const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

export const isCorrectGuess = (value: string, word: string): boolean =>
  normalize(value) === normalize(word);

export const hasGuessed = (round: TabooRound, playerId: string): boolean =>
  round.guesses.some((guess: TabooGuess) => guess.playerId === playerId);

/** Everyone seated except the clue-giver, who never submits a guess of their own. */
export const hasEveryoneGuessed = (round: TabooRound, seatedCount: number): boolean =>
  round.guesses.length >= Math.max(0, seatedCount - 1);

/**
 * TABOO needs no Host: a guess either matches the word or it does not. Unlike
 * QUIZ there is no speed bonus — the ask only wanted everyone who got it right
 * to score, not a race.
 */
export const computeTabooScores = (round: TabooRound): Record<string, number> => {
  const word = currentTurn(round)?.card.word ?? '';
  const scores: Record<string, number> = {};

  for (const guess of round.guesses) {
    scores[guess.playerId] = isCorrectGuess(guess.value, word) ? TABOO_CORRECT_POINTS : 0;
  }

  return scores;
};
