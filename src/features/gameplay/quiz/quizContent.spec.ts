import { describe, expect, it } from 'vitest';

import type { EduPartyClient } from '@/lib/supabase';
import { fetchQuizQuestions } from './quizContent';

const fakeClient = (result: { data: unknown; error: { message: string } | null }) => {
  const chain = { select: () => chain, eq: () => Promise.resolve(result) };
  return { from: () => chain } as unknown as EduPartyClient;
};

describe('fetchQuizQuestions', () => {
  it('maps a Postgres row into a QuizQuestion, snake_case and all', async () => {
    const client = fakeClient({
      data: [{ id: 'g1', topic: 'GENERAL', prompt: 'Sun?', options: ['A', 'B'], correct_index: 1 }],
      error: null,
    });

    const questions = await fetchQuizQuestions('GENERAL', client);

    expect(questions).toEqual([{ id: 'g1', prompt: 'Sun?', options: ['A', 'B'], correctIndex: 1 }]);
  });

  it('surfaces a query failure instead of returning an empty bank silently', async () => {
    const client = fakeClient({ data: null, error: { message: 'timeout' } });

    await expect(fetchQuizQuestions('GENERAL', client)).rejects.toThrow(/timeout/);
  });
});
