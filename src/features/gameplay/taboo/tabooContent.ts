import { getSupabaseClient, type EduPartyClient } from '@/lib/supabase';
import type { TabooCard } from '@/types';

/**
 * The deck lives in `public.taboo_cards` (#34), not the bundle: `forbidden`
 * words never ship to a client for a category the Host has not chosen.
 */
export const fetchTabooCards = async (
  categories: readonly string[],
  client: EduPartyClient = getSupabaseClient(),
): Promise<TabooCard[]> => {
  const { data, error } = await client
    .from('taboo_cards')
    .select()
    .in('category', [...categories]);

  if (error !== null) throw new Error(`Could not load TABOO cards: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    category: row.category,
    word: row.word,
    forbidden: row.forbidden,
  }));
};
