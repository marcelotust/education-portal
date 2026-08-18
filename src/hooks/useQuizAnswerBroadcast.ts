import { useCallback, useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { QuizAnswer } from '@/types';

const QUIZ_ANSWER_EVENT = 'quiz-answer';
const QUIZ_DEADLINE_EVENT = 'quiz-deadline';

interface UseQuizAnswerBroadcastOptions {
  pin: string;
  onAnswer: (answer: QuizAnswer) => void;
  /**
   * Fast path for the sped-up/red countdown (#105): the table write that
   * QUIZ_ALL_ANSWERED also makes is the source of truth for reconciliation
   * and late joiners, but it's too slow for Players to see the countdown
   * react before the round moves on. This mirrors onAnswer's relay.
   */
  onDeadline: (endsAt: string) => void;
}

export interface QuizAnswerChannel {
  sendAnswer: (answer: QuizAnswer) => void;
  sendDeadline: (endsAt: string) => void;
}

/**
 * QUIZ_ANSWERED needs the same relay STOP's answers already have: only the
 * Host writes the room, so a Player's pick has to reach the Host some other
 * way before END_ROUND can score it.
 */
export const useQuizAnswerBroadcast = ({
  pin,
  onAnswer,
  onDeadline,
}: UseQuizAnswerBroadcastOptions): QuizAnswerChannel => {
  const channelRef = useRef<QuizAnswerChannel | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client.channel(`room-answers:${pin}`);

    channel
      .on('broadcast', { event: QUIZ_ANSWER_EVENT }, ({ payload }) => {
        onAnswer(payload as QuizAnswer);
      })
      .on('broadcast', { event: QUIZ_DEADLINE_EVENT }, ({ payload }) => {
        onDeadline((payload as { endsAt: string }).endsAt);
      })
      .subscribe();

    channelRef.current = {
      sendAnswer: (answer) => {
        void channel.send({ type: 'broadcast', event: QUIZ_ANSWER_EVENT, payload: answer });
      },
      sendDeadline: (endsAt) => {
        void channel.send({ type: 'broadcast', event: QUIZ_DEADLINE_EVENT, payload: { endsAt } });
      },
    };

    return () => {
      channelRef.current = null;
      void client.removeChannel(channel);
    };
    // The callbacks are stable dispatch wrappers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const sendAnswer = useCallback(
    (answer: QuizAnswer) => channelRef.current?.sendAnswer(answer),
    [],
  );
  const sendDeadline = useCallback(
    (endsAt: string) => channelRef.current?.sendDeadline(endsAt),
    [],
  );

  return { sendAnswer, sendDeadline };
};
