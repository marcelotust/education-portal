import { describe, expect, it } from 'vitest';

import type { EduPartyClient } from '@/lib/supabase';
import { makeTabooRound } from '@/test/factories';
import type { TabooCard, TabooGuess, TabooRound, TabooSetup } from '@/types';
import {
  TABOO_CATEGORY_CATALOG,
  TABOO_CORRECT_POINTS,
  computeTabooScores,
  createTabooRound,
  currentTurn,
  drawTabooTurns,
  hasEveryoneGuessed,
  hasGuessed,
  isCorrectGuess,
  isLastTurn,
} from './tabooRound';

const cardPool: TabooCard[] = Array.from({ length: 8 }, (_, index) => ({
  id: `card-${index}`,
  category: 'ANIMALS',
  word: `WORD_${index}`,
  forbidden: ['A', 'B'],
}));

const setup = (overrides: Partial<TabooSetup> = {}): TabooSetup => ({
  roundDurationSeconds: 120,
  categories: [...TABOO_CATEGORY_CATALOG],
  ...overrides,
});

const seated = ['player-0', 'player-1', 'player-2'];

const fakeClient = (data: TabooCard[] | null): EduPartyClient => {
  const rows = data?.map((c) => ({ ...c })) ?? null;
  const chain = { select: () => chain, in: () => Promise.resolve({ data: rows, error: null }) };
  return { from: () => chain } as unknown as EduPartyClient;
};

describe('drawing a TABOO match from a fetched deck', () => {
  it('draws one turn per seated player, each card from the fetched deck', () => {
    const round = drawTabooTurns(cardPool, setup(), seated, new Date());

    expect(round.turns).toHaveLength(seated.length);
    expect(round.turns.every((turn) => cardPool.some((card) => card.id === turn.card.id))).toBe(
      true,
    );
    expect(round.currentIndex).toBe(0);
  });

  it('never repeats a card or a clue-giver inside one match', () => {
    const round = drawTabooTurns(cardPool, setup(), seated, new Date());

    expect(new Set(round.turns.map((turn) => turn.card.id)).size).toBe(round.turns.length);
    expect(new Set(round.turns.map((turn) => turn.clueGiverId)).size).toBe(round.turns.length);
  });

  it('only draws clue-givers from who is actually seated', () => {
    const round = drawTabooTurns(cardPool, setup(), seated, new Date());

    for (const turn of round.turns) {
      expect(seated).toContain(turn.clueGiverId);
    }
  });

  it('caps the match at whichever runs out first: seats or cards', () => {
    const manySeats = Array.from({ length: 50 }, (_, index) => `p${index}`);

    const round = drawTabooTurns(cardPool, setup(), manySeats, new Date());

    expect(round.turns.length).toBeLessThan(manySeats.length);
  });

  it('sets a deadline for the first turn from the chosen length', () => {
    const now = new Date('2026-07-25T10:00:00.000Z');

    const round = drawTabooTurns(cardPool, setup({ roundDurationSeconds: 60 }), seated, now);

    expect(round.endsAt).toBe('2026-07-25T10:01:00.000Z');
  });

  it('knows which turn is on and which one is the last', () => {
    const round = makeTabooRound({ currentIndex: 1 });

    expect(currentTurn(round)?.clueGiverId).toBe('player-1');
    expect(isLastTurn(round)).toBe(false);
    expect(isLastTurn({ ...round, currentIndex: 2 })).toBe(true);
  });
});

describe('fetching a TABOO match', () => {
  it('draws from whatever the chosen categories return', async () => {
    const client = fakeClient(cardPool);

    const round = await createTabooRound(setup(), seated, new Date(), client);

    expect(round.turns).toHaveLength(seated.length);
  });

  it('lets a fetch failure surface instead of dealing an empty match silently', async () => {
    const failing = {
      from: () => ({
        select: () => ({
          in: () => Promise.resolve({ data: null, error: { message: 'down' } }),
        }),
      }),
    } as unknown as EduPartyClient;

    await expect(createTabooRound(setup(), seated, new Date(), failing)).rejects.toThrow(/down/);
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

  it('scores every guess the Host approved', () => {
    const scores = computeTabooScores(
      roundWith([
        { playerId: 'player-1', value: 'elephant', isValid: true },
        { playerId: 'player-2', value: 'ELEFANT', isValid: true },
      ]),
    );

    expect(scores['player-1']).toBe(TABOO_CORRECT_POINTS);
    expect(scores['player-2']).toBe(TABOO_CORRECT_POINTS);
  });

  it('gives nothing for a rejected guess, unlike QUIZ there is no speed bonus either way', () => {
    const scores = computeTabooScores(
      roundWith([
        { playerId: 'player-1', value: 'giraffe', isValid: false },
        { playerId: 'player-2', value: 'elephant', isValid: true },
      ]),
    );

    expect(scores['player-1']).toBe(0);
    expect(scores['player-2']).toBe(TABOO_CORRECT_POINTS);
  });

  it('gives nothing for a guess still awaiting the Host, same as a rejected one', () => {
    const scores = computeTabooScores(
      roundWith([{ playerId: 'player-1', value: 'elephant', isValid: null }]),
    );

    expect(scores['player-1']).toBe(0);
  });

  it('tracks who has already guessed', () => {
    const round = roundWith([{ playerId: 'player-1', value: 'elephant', isValid: null }]);

    expect(hasGuessed(round, 'player-1')).toBe(true);
    expect(hasGuessed(round, 'player-2')).toBe(false);
  });

  it('is done once everyone but the clue-giver has guessed', () => {
    const round = roundWith([
      { playerId: 'player-1', value: 'x', isValid: null },
      { playerId: 'player-2', value: 'y', isValid: null },
    ]);

    // 3 seated, minus the clue-giver, minus the 2 who already guessed.
    expect(hasEveryoneGuessed(round, 3)).toBe(true);
    expect(hasEveryoneGuessed(round, 4)).toBe(false);
  });
});
