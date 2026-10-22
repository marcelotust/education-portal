import { useEffect, useRef } from 'react';

import type { Player, QuizRound, RoomEvent } from '@/types';
import { botBeatMs, botElapsedMs, botReplyDelayMs, planBotAnswer } from './quizBot';
import { currentQuestion, hasAnswered } from './quizRound';

interface UseQuizBotOptions {
  round: QuizRound | null;
  bot: Player | null;
  /** Ids of the real people seated, whose answers the bot waits on. */
  humanIds: readonly string[];
  isHost: boolean;
  dispatch: (event: RoomEvent) => void;
}

interface BotPlan {
  questionIndex: number;
  choice: number;
  delayMs: number;
  startedAt: number;
}

/**
 * Answers for the bot, on the Host's screen only. The Host is already the one
 * writer of the room, so the bot needs no server: its pick goes through the
 * same QUIZ_ANSWERED event as anyone's, and reaches Players with the row.
 *
 * The pick and the pace are planned once per question. The pace only exists to
 * give people time to think, so once every real player has answered the bot
 * replies after a short beat instead (#165).
 */
export const useQuizBot = ({ round, bot, humanIds, isHost, dispatch }: UseQuizBotOptions) => {
  const questionIndex = round?.currentIndex ?? -1;
  const planRef = useRef<BotPlan | null>(null);
  const roundRef = useRef(round);
  useEffect(() => {
    roundRef.current = round;
  });

  const humansDone =
    round !== null && humanIds.length > 0 && humanIds.every((id) => hasAnswered(round, id));

  useEffect(() => {
    if (!isHost || bot === null || round === null) return;
    if (hasAnswered(round, bot.id)) return;

    const question = currentQuestion(round);
    if (question === undefined) return;

    if (planRef.current?.questionIndex !== questionIndex) {
      const remainingMs = round.endsAt === null ? 0 : Date.parse(round.endsAt) - Date.now();
      planRef.current = {
        questionIndex,
        ...planBotAnswer(question, remainingMs, Math.random),
        startedAt: Date.now(),
      };
    }
    const plan = planRef.current;

    const delay = botReplyDelayMs({
      plannedLeftMs: plan.delayMs - (Date.now() - plan.startedAt),
      humansDone,
      beatMs: botBeatMs(Math.random),
    });

    const timer = setTimeout(() => {
      const humanTimes = (roundRef.current?.answers ?? [])
        .filter((answer) => humanIds.includes(answer.playerId))
        .map((answer) => answer.elapsedMs);
      const lastHuman = humanTimes.length === 0 ? null : Math.max(...humanTimes);

      dispatch({
        type: 'QUIZ_ANSWERED',
        answer: {
          playerId: bot.id,
          choice: plan.choice,
          elapsedMs: botElapsedMs(Date.now() - plan.startedAt, lastHuman),
        },
      });
    }, delay);

    return () => clearTimeout(timer);
    // Planned once per question and re-timed only when the humans finish: the
    // deadline shortening or an unrelated answer must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, bot?.id, questionIndex, humansDone]);
};
