import type { FeedbackCategory, FeedbackService } from '@/types/feedbackService';
import { ensureAnonymousSession } from '../auth';
import { getSupabaseClient, type EduPartyClient } from '../supabase';

const submitFeedback = async (
  client: EduPartyClient,
  category: FeedbackCategory,
  message: string,
): Promise<void> => {
  await ensureAnonymousSession(client);

  const { error } = await client.from('feedback').insert({ category, message });
  if (error !== null) throw new Error(`Could not submit feedback: ${error.message}`);
};

export const createSupabaseFeedbackService = (
  client: EduPartyClient = getSupabaseClient(),
): FeedbackService => ({
  submitFeedback: (category, message) => submitFeedback(client, category, message),
});
