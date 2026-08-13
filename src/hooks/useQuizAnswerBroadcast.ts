import { useCallback, useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { QuizAnswer } from '@/types';

const QUIZ_ANSWER_EVENT = 'quiz-answer';

interface UseQuizAnswerBroadcastOptions {
  pin: string;
  onAnswer: (answer: QuizAnswer) => void;
}

export interface QuizAnswerChannel {
  sendAnswer: (answer: QuizAnswer) => void;
}

/**
 * QUIZ_ANSWERED needs the same relay STOP's answers already have: only the
 * Host writes the room, so a Player's pick has to reach the Host some other
 * way before END_ROUND can score it.
 */
export const useQuizAnswerBroadcast = ({
  pin,
  onAnswer,
}: UseQuizAnswerBroadcastOptions): QuizAnswerChannel => {
  const channelRef = useRef<QuizAnswerChannel | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client.channel(`room-answers:${pin}`);

    channel
      .on('broadcast', { event: QUIZ_ANSWER_EVENT }, ({ payload }) => {
        onAnswer(payload as QuizAnswer);
      })
      .subscribe();

    channelRef.current = {
      sendAnswer: (answer) => {
        void channel.send({ type: 'broadcast', event: QUIZ_ANSWER_EVENT, payload: answer });
      },
    };

    return () => {
      channelRef.current = null;
      void client.removeChannel(channel);
    };
    // The callback is a stable dispatch wrapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const sendAnswer = useCallback(
    (answer: QuizAnswer) => channelRef.current?.sendAnswer(answer),
    [],
  );

  return { sendAnswer };
};
