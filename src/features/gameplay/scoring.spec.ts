import { describe, expect, it } from 'vitest';

import { makeRound } from '@/test/factories';
import type { StopAnswer } from '@/types';
import { DUPLICATE_POINTS, UNIQUE_POINTS, computeRoundScores } from './scoring';

const answer = (playerId: string, value: string, isValid: boolean | null = true): StopAnswer => ({
  playerId,
  category: 'ANIMAL',
  value,
  isValid,
});

const roundWith = (answers: readonly StopAnswer[]) =>
  makeRound({ phase: 'VALIDATION_PHASE', categories: ['ANIMAL'], answers });

describe('STOP scoring', () => {
  it('gives full points for an answer nobody else gave', () => {
    const scores = computeRoundScores(roundWith([answer('p1', 'BEAR'), answer('p2', 'BAT')]));

    expect(scores.p1).toBe(UNIQUE_POINTS);
    expect(scores.p2).toBe(UNIQUE_POINTS);
  });

  it('halves the points when two players wrote the same word', () => {
    const scores = computeRoundScores(roundWith([answer('p1', 'BEAR'), answer('p2', 'BEAR')]));

    expect(scores.p1).toBe(DUPLICATE_POINTS);
    expect(scores.p2).toBe(DUPLICATE_POINTS);
  });

  it('treats different casing and spacing as the same word', () => {
    const scores = computeRoundScores(roundWith([answer('p1', 'BEAR'), answer('p2', ' bear ')]));

    expect(scores.p1).toBe(DUPLICATE_POINTS);
  });

  it('scores nothing for an answer the Host rejected', () => {
    const scores = computeRoundScores(roundWith([answer('p1', 'BEAR', false)]));

    expect(scores.p1).toBe(0);
  });

  it('scores nothing for an empty answer, even if it was never judged', () => {
    const scores = computeRoundScores(roundWith([answer('p1', '', null)]));

    expect(scores.p1).toBe(0);
  });

  it('does not let a rejected duplicate drag down the valid one', () => {
    const scores = computeRoundScores(
      roundWith([answer('p1', 'BEAR'), answer('p2', 'BEAR', false)]),
    );

    expect(scores.p1).toBe(UNIQUE_POINTS);
    expect(scores.p2).toBe(0);
  });

  it('adds up every category of the round', () => {
    const round = makeRound({
      phase: 'VALIDATION_PHASE',
      categories: ['ANIMAL', 'FOOD'],
      answers: [
        { playerId: 'p1', category: 'ANIMAL', value: 'BEAR', isValid: true },
        { playerId: 'p1', category: 'FOOD', value: 'BREAD', isValid: true },
      ],
    });

    expect(computeRoundScores(round).p1).toBe(UNIQUE_POINTS * 2);
  });

  it('reports zero for a player who answered nothing at all', () => {
    const scores = computeRoundScores(roundWith([answer('p1', 'BEAR')]), ['p1', 'p2']);

    expect(scores.p2).toBe(0);
  });
});
