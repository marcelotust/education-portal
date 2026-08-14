import { describe, expect, it } from 'vitest';

import type { EduPartyClient } from '@/lib/supabase';
import { fetchTabooCards } from './tabooContent';

const fakeClient = (result: { data: unknown; error: { message: string } | null }) => {
  const chain = { select: () => chain, in: () => Promise.resolve(result) };
  return { from: () => chain } as unknown as EduPartyClient;
};

describe('fetchTabooCards', () => {
  it('maps a Postgres row into a TabooCard', async () => {
    const client = fakeClient({
      data: [{ id: 'a1', category: 'ANIMALS', word: 'ELEPHANT', forbidden: ['TRUNK', 'ZOO'] }],
      error: null,
    });

    const cards = await fetchTabooCards(['ANIMALS'], client);

    expect(cards).toEqual([
      { id: 'a1', category: 'ANIMALS', word: 'ELEPHANT', forbidden: ['TRUNK', 'ZOO'] },
    ]);
  });

  it('surfaces a query failure instead of returning an empty deck silently', async () => {
    const client = fakeClient({ data: null, error: { message: 'timeout' } });

    await expect(fetchTabooCards(['ANIMALS'], client)).rejects.toThrow(/timeout/);
  });
});
