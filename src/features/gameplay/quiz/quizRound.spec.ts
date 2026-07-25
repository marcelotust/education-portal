import { describe, expect, it } from 'vitest';

import type { QuizAnswer, QuizRound } from '@/types';
import {
  CORRECT_POINTS,
  QUESTION_PACKS,
  SPEED_BONUS,
  computeQuizScores,
  createQuizRound,
} from './quizRound';

const roundWith = (answers: readonly QuizAnswer[]): QuizRound => ({
  game: 'QUIZ',
  question: {
    id: 'q1',
    prompt: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Mars', 'Earth'],
    correctIndex: 1,
  },
  answers,
  endsAt: null,
  isScored: false,
});

const answer = (playerId: string, choice: number, elapsedMs: number): QuizAnswer => ({
  playerId,
  choice,
  elapsedMs,
});

describe('QUIZ round', () => {
  it('draws a question from the chosen pack', () => {
    const round = createQuizRound({ roundDurationSeconds: 30, topic: 'SCIENCE' });

    const science = QUESTION_PACKS.find((pack) => pack.topic === 'SCIENCE')?.questions ?? [];
    expect(science.map((question) => question.id)).toContain(round.question.id);
  });

  it('avoids questions already asked in this session', () => {
    const asked = ['g1', 'g2'];

    const round = createQuizRound({ roundDurationSeconds: 30, topic: 'GENERAL' }, asked);

    expect(asked).not.toContain(round.question.id);
  });

  it('falls back to the whole pack once every question has been asked', () => {
    const all = QUESTION_PACKS[0]!.questions.map((question) => question.id);

    const round = createQuizRound({ roundDurationSeconds: 30, topic: 'GENERAL' }, all);

    expect(all).toContain(round.question.id);
  });

  it('sets a deadline from the chosen length', () => {
    const now = new Date('2026-07-25T10:00:00.000Z');

    const round = createQuizRound({ roundDurationSeconds: 30, topic: 'GENERAL' }, [], now);

    expect(round.endsAt).toBe('2026-07-25T10:00:30.000Z');
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
