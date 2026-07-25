import { useCallback, useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { StopAnswer } from '@/types';

const ANSWERS_EVENT = 'answers';
const STOP_EVENT = 'stop';

interface AnswersMessage {
  playerId: string;
  answers: readonly StopAnswer[];
}

interface UseAnswerBroadcastOptions {
  pin: string;
  onAnswers: (message: AnswersMessage) => void;
  /** Somebody filled every category and called STOP. */
  onStopCalled: (playerId: string) => void;
}

export interface AnswerChannel {
  sendAnswers: (message: AnswersMessage) => void;
  callStop: (playerId: string) => void;
}

/**
 * Answers travel over Broadcast, never through the table: RLS keeps the room
 * Host-writable, and six students typing at once should not fight over one row.
 * The Host consolidates what arrives and persists the result.
 */
export const useAnswerBroadcast = ({
  pin,
  onAnswers,
  onStopCalled,
}: UseAnswerBroadcastOptions): AnswerChannel => {
  const channelRef = useRef<AnswerChannel | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client.channel(`room-answers:${pin}`);

    channel
      .on('broadcast', { event: ANSWERS_EVENT }, ({ payload }) => {
        onAnswers(payload as AnswersMessage);
      })
      .on('broadcast', { event: STOP_EVENT }, ({ payload }) => {
        onStopCalled((payload as { playerId: string }).playerId);
      })
      .subscribe();

    channelRef.current = {
      sendAnswers: (message) => {
        void channel.send({ type: 'broadcast', event: ANSWERS_EVENT, payload: message });
      },
      callStop: (playerId) => {
        void channel.send({ type: 'broadcast', event: STOP_EVENT, payload: { playerId } });
      },
    };

    return () => {
      channelRef.current = null;
      void client.removeChannel(channel);
    };
    // The callbacks are stable dispatch wrappers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const sendAnswers = useCallback(
    (message: AnswersMessage) => channelRef.current?.sendAnswers(message),
    [],
  );
  const callStop = useCallback((playerId: string) => channelRef.current?.callStop(playerId), []);

  return { sendAnswers, callStop };
};
