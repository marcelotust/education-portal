import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

export type EduPartyClient = SupabaseClient<Database>;

let client: EduPartyClient | null = null;

const readEnv = (key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing ${key}. Copy .env.example to .env.local and fill it in.`);
  }
  return value;
};

/**
 * Lazily created singleton: importing this module must not blow up in tests or
 * in environments where the Supabase env vars are absent.
 */
export const getSupabaseClient = (): EduPartyClient => {
  client ??= createClient<Database>(
    readEnv('VITE_SUPABASE_URL'),
    readEnv('VITE_SUPABASE_ANON_KEY'),
    {
      auth: {
        // Students join anonymously; the session must survive a page refresh.
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        // A room holds at most 6 players, so a low rate keeps costs predictable.
        params: { eventsPerSecond: 10 },
      },
    },
  );

  return client;
};
