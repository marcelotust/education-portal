import type { TabooCard, TabooGuess, TabooRound, TabooSetup, TabooTurn } from '@/types';

/** Flat points for a correct guess; nobody is judged, so there is no bonus to argue about. */
export const TABOO_CORRECT_POINTS = 10;

export const TABOO_CATEGORY_CATALOG: readonly string[] = ['ANIMALS', 'MOVIES'];

/**
 * The built-in deck, same trade-off as QUIZ's question bank: it ships in the
 * client bundle, so the word is technically readable before it is revealed.
 * Fine for a classroom game; see issue #27 for the real deck and the bundle
 * question this reopens.
 */
const TABOO_DECK: readonly TabooCard[] = [
  {
    id: 'a1',
    word: 'ELEPHANT',
    forbidden: ['TRUNK', 'AFRICA', 'TUSK', 'GRAY', 'ZOO'],
    category: 'ANIMALS',
  },
  {
    id: 'a2',
    word: 'PENGUIN',
    forbidden: ['BIRD', 'ICE', 'BLACK', 'WHITE', 'SWIM'],
    category: 'ANIMALS',
  },
  {
    id: 'a3',
    word: 'GIRAFFE',
    forbidden: ['NECK', 'TALL', 'SPOTS', 'AFRICA', 'ZOO'],
    category: 'ANIMALS',
  },
  {
    id: 'a4',
    word: 'KANGAROO',
    forbidden: ['POUCH', 'AUSTRALIA', 'JUMP', 'HOP', 'BOXING'],
    category: 'ANIMALS',
  },
  {
    id: 'm1',
    word: 'TITANIC',
    forbidden: ['SHIP', 'ICEBERG', 'SINK', 'OCEAN', 'LEONARDO'],
    category: 'MOVIES',
  },
  {
    id: 'm2',
    word: 'JAWS',
    forbidden: ['SHARK', 'OCEAN', 'BEACH', 'ATTACK', 'FIN'],
    category: 'MOVIES',
  },
  {
    id: 'm3',
    word: 'FROZEN',
    forbidden: ['SNOW', 'ICE', 'ELSA', 'QUEEN', 'COLD'],
    category: 'MOVIES',
  },
  {
    id: 'm4',
    word: 'MATRIX',
    forbidden: ['PILL', 'COMPUTER', 'NEO', 'REALITY', 'SIMULATION'],
    category: 'MOVIES',
  },
];

/** A fresh room is playable without touching the setup. */
export const DEFAULT_TABOO_SETUP: TabooSetup = {
  roundDurationSeconds: 120,
  categories: ['ANIMALS', 'MOVIES'],
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
 * Draws the whole match up front, like QUIZ: one card per seated player, so
 * every screen agrees on who goes next. A thin deck or a thin room caps the
 * match short rather than repeating a card or a clue-giver.
 */
export const createTabooRound = (
  setup: TabooSetup,
  seatedPlayerIds: readonly string[],
  now = new Date(),
): TabooRound => {
  const cards = shuffled(TABOO_DECK.filter((card) => setup.categories.includes(card.category)));
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
