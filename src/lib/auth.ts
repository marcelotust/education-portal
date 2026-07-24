import type { EduPartyClient } from './supabase';

/**
 * Students never sign up: every participant is an anonymous Supabase user.
 * Reuses the persisted session so a refresh does not create a new identity.
 */
export const ensureAnonymousSession = async (client: EduPartyClient): Promise<string> => {
  const { data: existing } = await client.auth.getSession();
  if (existing.session) return existing.session.user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error !== null || !data.user) {
    throw new Error(`Anonymous sign-in failed: ${error?.message ?? 'no user returned'}`);
  }

  return data.user.id;
};
