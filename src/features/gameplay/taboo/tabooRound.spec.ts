import { describe, expect, it } from 'vitest';

import { makeTabooRound } from '@/test/factories';
import type { TabooGuess, TabooRound, TabooSetup } from '@/types';
import {
  TABOO_CATEGORY_CATALOG,
  TABOO_CORRECT_POINTS,
  computeTabooScores,
  createTabooRound,
  currentTurn,
  hasEveryoneGuessed,
  hasGuessed,
  isCorrectGuess,
  isLastTurn,
} from './tabooRound';

const setup = (overrides: Partial<TabooSetup> = {}): TabooSetup => ({
  roundDurationSeconds: 120,
  categories: [...TABOO_CATEGORY_CATALOG],
  ...overrides,
});

const seated = ['player-0', 'player-1', 'player-2'];

describe('TABOO match', () => {
  it('draws one turn per seated player, each card from a chosen category', () => {
    const round = createTabooRound(setup(), seated);

    expect(round.turns).toHaveLength(seated.length);
    expect(round.turns.every((turn) => TABOO_CATEGORY_CATALOG.includes(turn.card.category))).toBe(
      true,
    );
    expect(round.currentIndex).toBe(0);
  });

  it('never repeats a card or a clue-giver inside one match', () => {
    const round = createTabooRound(setup(), seated);

    expect(new Set(round.turns.map((turn) => turn.card.id)).size).toBe(round.turns.length);
    expect(new Set(round.turns.map((turn) => turn.clueGiverId)).size).toBe(round.turns.length);
  });

  it('only draws clue-givers from who is actually seated', () => {
    const round = createTabooRound(setup(), seated);

    for (const turn of round.turns) {
      expect(seated).toContain(turn.clueGiverId);
    }
  });

  it('caps the match at whichever runs out first: seats or cards', () => {
    // More fake seats than any single category's deck could possibly hold.
    const manySeats = Array.from({ length: 50 }, (_, index) => `p${index}`);

    const oneCategory = createTabooRound(setup({ categories: ['ANIMALS'] }), manySeats);

    expect(oneCategory.turns.length).toBeLessThan(manySeats.length);
  });

  it('sets a deadline for the first turn from the chosen length', () => {
    const now = new Date('2026-07-25T10:00:00.000Z');

    const round = createTabooRound(setup({ roundDurationSeconds: 60 }), seated, now);

    expect(round.endsAt).toBe('2026-07-25T10:01:00.000Z');
  });

  it('knows which turn is on and which one is the last', () => {
    const round = makeTabooRound({ currentIndex: 1 });

    expect(currentTurn(round)?.clueGiverId).toBe('player-1');
    expect(isLastTurn(round)).toBe(false);
    expect(isLastTurn({ ...round, currentIndex: 2 })).toBe(true);
  });
});

describe('guess matching', () => {
  it('matches the word exactly', () => {
    expect(isCorrectGuess('ELEPHANT', 'ELEPHANT')).toBe(true);
  });

  it('ignores case', () => {
    expect(isCorrectGuess('elephant', 'ELEPHANT')).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isCorrectGuess('  elephant  ', 'ELEPHANT')).toBe(true);
  });

  it('ignores accents', () => {
    expect(isCorrectGuess('cafe', 'CAFÉ')).toBe(true);
  });

  it('rejects a different word', () => {
    expect(isCorrectGuess('GIRAFFE', 'ELEPHANT')).toBe(false);
  });
});

describe('TABOO scoring', () => {
  /** The factory's first turn is ELEPHANT, guessed by whoever is not the clue-giver. */
  const roundWith = (guesses: readonly TabooGuess[]): TabooRound => makeTabooRound({ guesses });

  it('scores everyone who guessed the word right', () => {
    const scores = computeTabooScores(
      roundWith([
        { playerId: 'player-1', value: 'elephant' },
        { playerId: 'player-2', value: 'ELEPHANT' },
      ]),
    );

    expect(scores['player-1']).toBe(TABOO_CORRECT_POINTS);
    expect(scores['player-2']).toBe(TABOO_CORRECT_POINTS);
  });

  it('gives nothing for a wrong guess, unlike QUIZ there is no speed bonus either way', () => {
    const scores = computeTabooScores(
      roundWith([
        { playerId: 'player-1', value: 'giraffe' },
        { playerId: 'player-2', value: 'elephant' },
      ]),
    );

    expect(scores['player-1']).toBe(0);
    expect(scores['player-2']).toBe(TABOO_CORRECT_POINTS);
  });

  it('tracks who has already guessed', () => {
    const round = roundWith([{ playerId: 'player-1', value: 'elephant' }]);

    expect(hasGuessed(round, 'player-1')).toBe(true);
    expect(hasGuessed(round, 'player-2')).toBe(false);
  });

  it('is done once everyone but the clue-giver has guessed', () => {
    const round = roundWith([
      { playerId: 'player-1', value: 'x' },
      { playerId: 'player-2', value: 'y' },
    ]);

    // 3 seated, minus the clue-giver, minus the 2 who already guessed.
    expect(hasEveryoneGuessed(round, 3)).toBe(true);
    expect(hasEveryoneGuessed(round, 4)).toBe(false);
  });
});
