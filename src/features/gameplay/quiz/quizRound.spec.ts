import { describe, expect, it } from 'vitest';

import { makeQuizRound } from '@/test/factories';
import type { QuizAnswer, QuizRound, QuizSetup } from '@/types';
import { QUESTION_PACKS } from './questionPacks';
import {
  CORRECT_POINTS,
  SPEED_BONUS,
  computeQuizScores,
  createQuizRound,
  currentQuestion,
  isLastQuestion,
} from './quizRound';

const setup = (overrides: Partial<QuizSetup> = {}): QuizSetup => ({
  roundDurationSeconds: 30,
  topic: 'GENERAL',
  questionCount: 3,
  ...overrides,
});

/** The factory's first question is the one about the Sun; correct index is 1. */
const roundWith = (answers: readonly QuizAnswer[]): QuizRound => makeQuizRound({ answers });

const answer = (playerId: string, choice: number, elapsedMs: number): QuizAnswer => ({
  playerId,
  choice,
  elapsedMs,
});

describe('QUIZ match', () => {
  it('draws the whole match from the chosen pack, on the first question', () => {
    const round = createQuizRound(setup({ topic: 'SCIENCE', questionCount: 5 }));

    const science = QUESTION_PACKS.find((pack) => pack.topic === 'SCIENCE')?.questions ?? [];
    const ids = science.map((question) => question.id);
    expect(round.questions).toHaveLength(5);
    expect(round.questions.every((question) => ids.includes(question.id))).toBe(true);
    expect(round.currentIndex).toBe(0);
  });

  it('never asks the same question twice inside one match', () => {
    const round = createQuizRound(setup({ questionCount: 10 }));

    const ids = round.questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('caps the match at what the topic actually holds', () => {
    const pool = QUESTION_PACKS[0]!.questions.length;

    const round = createQuizRound(setup({ questionCount: 10 }));

    expect(round.questions.length).toBe(Math.min(10, pool));
  });

  it('prefers questions the room has not seen yet', () => {
    const asked = QUESTION_PACKS[0]!.questions.slice(0, 2).map((question) => question.id);

    const round = createQuizRound(setup({ questionCount: 3 }), asked);

    expect(round.questions.map((question) => question.id)).not.toContain(asked[0]);
  });

  it('reuses old questions rather than running a shorter match', () => {
    const all = QUESTION_PACKS[0]!.questions.map((question) => question.id);

    const round = createQuizRound(setup({ questionCount: 3 }), all);

    expect(round.questions).toHaveLength(3);
  });

  it('sets a deadline for the first question from the chosen length', () => {
    const now = new Date('2026-07-25T10:00:00.000Z');

    const round = createQuizRound(setup(), [], now);

    expect(round.endsAt).toBe('2026-07-25T10:00:30.000Z');
  });

  it('knows which question is on and which one is the last', () => {
    const round = makeQuizRound({ currentIndex: 1 });

    expect(currentQuestion(round)?.id).toBe('q2');
    expect(isLastQuestion(round)).toBe(false);
    expect(isLastQuestion({ ...round, currentIndex: 2 })).toBe(true);
  });
});

describe('QUIZ scoring', () => {
  it('scores a correct answer without anybody judging it', () => {
    const scores = computeQuizScores(roundWith([answer('p1', 1, 4000)]));

    expect(scores.p1).toBe(CORRECT_POINTS + SPEED_BONUS);
  });

  it('gives nothing for a wrong answer', () => {
    const scores = computeQuizScores(roundWith([answer('p1', 0, 1000)]));

    expect(scores.p1).toBe(0);
  });

  it('gives the speed bonus to the fastest correct answer only', () => {
    const scores = computeQuizScores(
      roundWith([answer('p1', 1, 5000), answer('p2', 1, 1200), answer('p3', 1, 9000)]),
    );

    expect(scores.p2).toBe(CORRECT_POINTS + SPEED_BONUS);
    expect(scores.p1).toBe(CORRECT_POINTS);
    expect(scores.p3).toBe(CORRECT_POINTS);
  });

  it('does not hand the bonus to somebody who was fast and wrong', () => {
    const scores = computeQuizScores(roundWith([answer('p1', 0, 100), answer('p2', 1, 8000)]));

    expect(scores.p1).toBe(0);
    expect(scores.p2).toBe(CORRECT_POINTS + SPEED_BONUS);
  });
});
