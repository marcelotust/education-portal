import { useCallback, useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { TabooGuess } from '@/types';

const TABOO_GUESS_EVENT = 'taboo-guess';

interface UseTabooGuessBroadcastOptions {
  pin: string;
  onGuess: (guess: TabooGuess) => void;
}

export interface TabooGuessChannel {
  sendGuess: (guess: TabooGuess) => void;
}

/**
 * TABOO_GUESSED needs the same relay QUIZ_ANSWERED and STOP's answers already
 * have: only the Host writes the room, so a Player's guess has to reach the
 * Host some other way before END_ROUND can score it.
 */
export const useTabooGuessBroadcast = ({
  pin,
  onGuess,
}: UseTabooGuessBroadcastOptions): TabooGuessChannel => {
  const channelRef = useRef<TabooGuessChannel | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client.channel(`room-answers:${pin}`);

    channel
      .on('broadcast', { event: TABOO_GUESS_EVENT }, ({ payload }) => {
        onGuess(payload as TabooGuess);
      })
      .subscribe();

    channelRef.current = {
      sendGuess: (guess) => {
        void channel.send({ type: 'broadcast', event: TABOO_GUESS_EVENT, payload: guess });
      },
    };

    return () => {
      channelRef.current = null;
      void client.removeChannel(channel);
    };
    // The callback is a stable dispatch wrapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const sendGuess = useCallback((guess: TabooGuess) => channelRef.current?.sendGuess(guess), []);

  return { sendGuess };
};
