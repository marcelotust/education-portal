import { describe, expect, it } from 'vitest';

import { makeRound } from '@/test/factories';
import type { StopAnswer } from '@/types';
import {
  DUPLICATE_POINTS,
  UNIQUE_POINTS,
  computeAnswerPoints,
  computeRoundScores,
} from './scoring';

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

describe('per-answer points', () => {
  const pointsFor = (round: ReturnType<typeof roundWith>, playerId: string) =>
    computeAnswerPoints(round).find((entry) => entry.playerId === playerId)?.points;

  it('shows what each answer is worth while the Host judges', () => {
    const round = roundWith([answer('p1', 'BEAR'), answer('p2', 'BAT')]);

    expect(pointsFor(round, 'p1')).toBe(UNIQUE_POINTS);
  });

  it('halves a word two players share', () => {
    const round = roundWith([answer('p1', 'BEAR'), answer('p2', 'BEAR')]);

    expect(pointsFor(round, 'p1')).toBe(DUPLICATE_POINTS);
  });

  it('gives a rejected answer nothing, and hands the points back to the other player', () => {
    const round = roundWith([answer('p1', 'BEAR'), answer('p2', 'BEAR', false)]);

    expect(pointsFor(round, 'p2')).toBe(0);
    expect(pointsFor(round, 'p1')).toBe(UNIQUE_POINTS);
  });

  it('adds up to the same totals the scoreboard shows', () => {
    const round = roundWith([answer('p1', 'BEAR'), answer('p2', 'BEAR'), answer('p3', 'BEE')]);

    const totals = computeRoundScores(round);
    const perAnswer = computeAnswerPoints(round);

    for (const playerId of ['p1', 'p2', 'p3']) {
      const summed = perAnswer
        .filter((entry) => entry.playerId === playerId)
        .reduce((total, entry) => total + entry.points, 0);
      expect(summed).toBe(totals[playerId]);
    }
  });
});
