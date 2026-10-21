import { useEffect } from 'react';

import type { Player, QuizRound, RoomEvent } from '@/types';
import { planBotAnswer } from './quizBot';
import { currentQuestion, hasAnswered } from './quizRound';

interface UseQuizBotOptions {
  round: QuizRound | null;
  bot: Player | null;
  isHost: boolean;
  dispatch: (event: RoomEvent) => void;
}

/**
 * Answers for the bot, on the Host's screen only. The Host is already the one
 * writer of the room, so the bot needs no server: its pick goes through the
 * same QUIZ_ANSWERED event as anyone's, and reaches Players with the row.
 */
export const useQuizBot = ({ round, bot, isHost, dispatch }: UseQuizBotOptions) => {
  const questionIndex = round?.currentIndex ?? -1;

  useEffect(() => {
    if (!isHost || bot === null || round === null) return;
    if (hasAnswered(round, bot.id)) return;

    const question = currentQuestion(round);
    if (question === undefined) return;

    const remainingMs = round.endsAt === null ? 0 : Date.parse(round.endsAt) - Date.now();
    const { choice, delayMs } = planBotAnswer(question, remainingMs, Math.random);

    const timer = setTimeout(() => {
      dispatch({
        type: 'QUIZ_ANSWERED',
        answer: { playerId: bot.id, choice, elapsedMs: delayMs },
      });
    }, delayMs);

    return () => clearTimeout(timer);
    // Planned once per question: the deadline shortening mid-question must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, bot?.id, questionIndex]);
};
