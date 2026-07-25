import { useCallback, useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { StopAnswer } from '@/types';

const ANSWERS_EVENT = 'answers';

interface AnswersMessage {
  playerId: string;
  answers: readonly StopAnswer[];
}

interface UseAnswerBroadcastOptions {
  pin: string;
  onAnswers: (message: AnswersMessage) => void;
}

/**
 * Answers travel over Broadcast, never through the table: RLS keeps the room
 * Host-writable, and six students typing at once should not fight over one row.
 * The Host consolidates what arrives and persists the result.
 */
export const useAnswerBroadcast = ({ pin, onAnswers }: UseAnswerBroadcastOptions) => {
  const send = useRef<((message: AnswersMessage) => void) | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client.channel(`room-answers:${pin}`);

    channel
      .on('broadcast', { event: ANSWERS_EVENT }, ({ payload }) => {
        onAnswers(payload as AnswersMessage);
      })
      .subscribe();

    send.current = (message) => {
      void channel.send({ type: 'broadcast', event: ANSWERS_EVENT, payload: message });
    };

    return () => {
      send.current = null;
      void client.removeChannel(channel);
    };
    // onAnswers is a stable dispatch wrapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return useCallback((message: AnswersMessage) => send.current?.(message), []);
};
