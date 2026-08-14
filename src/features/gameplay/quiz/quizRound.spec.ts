import { describe, expect, it } from 'vitest';

import type { EduPartyClient } from '@/lib/supabase';
import { makeQuizRound } from '@/test/factories';
import type { QuizAnswer, QuizQuestion, QuizRound, QuizSetup } from '@/types';
import {
  CORRECT_POINTS,
  SPEED_BONUS,
  computeQuizScores,
  createQuizRound,
  currentQuestion,
  drawQuizQuestions,
  isLastQuestion,
} from './quizRound';

/** A pool big enough to exercise the unasked-first preference, small enough to cap on 10. */
const pool: QuizQuestion[] = Array.from({ length: 8 }, (_, index) => ({
  id: `q${index}`,
  prompt: `Prompt ${index}`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: index % 4,
}));

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

const fakeClient = (data: QuizQuestion[] | null): EduPartyClient => {
  const rows =
    data?.map((q) => ({
      id: q.id,
      topic: 'GENERAL',
      prompt: q.prompt,
      options: q.options,
      correct_index: q.correctIndex,
    })) ?? null;
  const chain = { select: () => chain, eq: () => Promise.resolve({ data: rows, error: null }) };
  return { from: () => chain } as unknown as EduPartyClient;
};

describe('drawing a QUIZ match from a fetched pool', () => {
  it('draws the whole match from the pool, on the first question', () => {
    const round = drawQuizQuestions(pool, setup({ questionCount: 5 }), [], new Date());

    const ids = pool.map((question) => question.id);
    expect(round.questions).toHaveLength(5);
    expect(round.questions.every((question) => ids.includes(question.id))).toBe(true);
    expect(round.currentIndex).toBe(0);
  });

  it('never asks the same question twice inside one match', () => {
    const round = drawQuizQuestions(pool, setup({ questionCount: 10 }), [], new Date());

    const ids = round.questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('caps the match at what the pool actually holds', () => {
    const round = drawQuizQuestions(pool, setup({ questionCount: 10 }), [], new Date());

    expect(round.questions.length).toBe(pool.length);
  });

  it('prefers questions the room has not seen yet', () => {
    const asked = pool.slice(0, 2).map((question) => question.id);

    const round = drawQuizQuestions(pool, setup({ questionCount: 3 }), asked, new Date());

    expect(round.questions.map((question) => question.id)).not.toContain(asked[0]);
  });

  it('reuses old questions rather than running a shorter match', () => {
    const all = pool.map((question) => question.id);

    const round = drawQuizQuestions(pool, setup({ questionCount: 3 }), all, new Date());

    expect(round.questions).toHaveLength(3);
  });

  it('sets a deadline for the first question from the chosen length', () => {
    const now = new Date('2026-07-25T10:00:00.000Z');

    const round = drawQuizQuestions(pool, setup(), [], now);

    expect(round.endsAt).toBe('2026-07-25T10:00:30.000Z');
  });

  it('knows which question is on and which one is the last', () => {
    const round = makeQuizRound({ currentIndex: 1 });

    expect(currentQuestion(round)?.id).toBe('q2');
    expect(isLastQuestion(round)).toBe(false);
    expect(isLastQuestion({ ...round, currentIndex: 2 })).toBe(true);
  });
});

describe('fetching a QUIZ match', () => {
  it('draws from whatever the chosen topic returns', async () => {
    const client = fakeClient(pool.slice(0, 3));

    const round = await createQuizRound(setup({ questionCount: 3 }), [], new Date(), client);

    expect(round.questions).toHaveLength(3);
  });

  it('lets a fetch failure surface instead of dealing an empty match silently', async () => {
    const failing = {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: { message: 'down' } }),
        }),
      }),
    } as unknown as EduPartyClient;

    await expect(createQuizRound(setup(), [], new Date(), failing)).rejects.toThrow(/down/);
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
