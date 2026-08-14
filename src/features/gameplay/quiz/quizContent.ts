import { getSupabaseClient, type EduPartyClient } from '@/lib/supabase';
import type { QuizQuestion } from '@/types';

/**
 * The question bank lives in `public.quiz_questions` (#34), not the bundle:
 * `correctIndex` never ships to a client that has not asked for this topic.
 */
export const fetchQuizQuestions = async (
  topic: string,
  client: EduPartyClient = getSupabaseClient(),
): Promise<QuizQuestion[]> => {
  const { data, error } = await client.from('quiz_questions').select().eq('topic', topic);

  if (error !== null) throw new Error(`Could not load QUIZ questions: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    options: row.options,
    correctIndex: row.correct_index,
  }));
};
