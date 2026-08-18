import { useCallback, useEffect, useRef, useState } from 'react';

import { RetroContainer } from '@/components/ui/RetroContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCountdown } from '@/hooks/useCountdown';
import { useQuizAnswerBroadcast } from '@/hooks/useQuizAnswerBroadcast';
import { useRoom } from '@/hooks/useRoom';
import type { QuizAnswer } from '@/types';
import { cn } from '@/utils/cn';
import { countPlayers } from '@/utils/room';
import { currentQuestion, hasAnswered, hasEveryoneAnswered } from './quizRound';

const LETTERS = ['A', 'B', 'C', 'D'];

/** Long enough to read, short enough to feel earned; matches STOP's grace period. */
const QUIZ_GRACE_MS = 5000;

const urgencyFor = (secondsLeft: number): 'calm' | 'warning' | 'critical' => {
  if (secondsLeft <= 5) return 'critical';
  if (secondsLeft <= 10) return 'warning';
  return 'calm';
};

const URGENCY_STYLES = {
  calm: 'text-sky-600',
  warning: 'text-yellow-500 scale-110',
  critical: 'animate-blink text-rose-500 scale-125',
} as const;

interface QuizRoundScreenProps {
  playerId: string;
}

/** QUIZ needs no Host to judge: the round scores itself when time is up. */
export const QuizRoundScreen = ({ playerId }: QuizRoundScreenProps) => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound?.game === 'QUIZ' ? state.currentRound : null;
  const secondsLeft = useCountdown(round?.endsAt ?? null);
  const questionIndex = round?.currentIndex ?? 0;
  // Which question the pick belongs to, so the next one starts unanswered
  // without an effect having to clear it.
  const [pick, setPick] = useState<{ questionIndex: number; choice: number } | null>(null);
  const picked = pick?.questionIndex === questionIndex ? pick.choice : null;
  // Answer speed is measured from the moment the question appeared.
  const shownAt = useRef(0);
  // Which question QUIZ_ALL_ANSWERED already fired for, so it triggers once.
  const allAnsweredFor = useRef(-1);

  useEffect(() => {
    shownAt.current = Date.now();
    allAnsweredFor.current = -1;
  }, [questionIndex]);

  useEffect(() => {
    // Only the Host closes the round, so it happens once for everyone.
    if (isHost && secondsLeft <= 0 && round !== null) dispatch({ type: 'END_ROUND' });
  }, [isHost, secondsLeft, round, dispatch]);

  const onAnswer = useCallback(
    (received: QuizAnswer) => dispatch({ type: 'QUIZ_ANSWERED', answer: received }),
    [dispatch],
  );
  // Fast path for the sped-up/red countdown (#105): a Player applies a
  // Host-originated deadline the instant the broadcast lands, instead of
  // waiting on the much slower table write + postgres_changes round trip.
  const onDeadline = useCallback(
    (endsAt: string) => dispatch({ type: 'QUIZ_DEADLINE_RECEIVED', endsAt }),
    [dispatch],
  );
  const channel = useQuizAnswerBroadcast({ pin: state.pin, onAnswer, onDeadline });

  useEffect(() => {
    // Only the Host pulls the deadline in, so it happens once for everyone.
    if (!isHost || round === null || allAnsweredFor.current === questionIndex) return;
    if (!hasEveryoneAnswered(round, countPlayers(state))) return;

    allAnsweredFor.current = questionIndex;
    const endsAt = new Date(Date.now() + QUIZ_GRACE_MS).toISOString();
    // Broadcast first: Players see it instantly. The dispatch below still
    // persists to rooms.state, the source of truth for reconciliation and
    // late joiners — see docs/decisions/0001-room-state-transport.md.
    channel.sendDeadline(endsAt);
    dispatch({ type: 'QUIZ_ALL_ANSWERED', endsAt });
  }, [isHost, round, questionIndex, state, dispatch, channel]);

  const answer = useCallback(
    (choice: number) => {
      if (round === null || picked !== null || hasAnswered(round, playerId)) return;
      setPick({ questionIndex, choice });
      const submitted: QuizAnswer = { playerId, choice, elapsedMs: Date.now() - shownAt.current };
      dispatch({ type: 'QUIZ_ANSWERED', answer: submitted });
      channel.sendAnswer(submitted);
    },
    [round, picked, questionIndex, playerId, dispatch, channel],
  );

  const question = round === null ? undefined : currentQuestion(round);
  if (round === null || question === undefined) return null;

  const urgency = urgencyFor(secondsLeft);
  const everyoneAnswered = hasEveryoneAnswered(round, countPlayers(state));

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <header className="sticky top-[var(--header-height,64px)] z-10 -mx-6 -mt-6 flex items-center justify-between gap-3 border-b-4 border-ink bg-white/95 px-6 py-2 backdrop-blur">
        <div className="flex flex-col items-center">
          <SectionLabel>Question</SectionLabel>
          <span data-testid="question-progress" className="font-arcade text-sm text-green-600">
            {questionIndex + 1}/{round.questions.length}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <SectionLabel>Time</SectionLabel>
          <span
            data-testid="round-timer"
            data-urgency={urgency}
            className={cn(
              'font-arcade text-2xl transition-transform duration-300',
              URGENCY_STYLES[urgency],
            )}
          >
            {secondsLeft}
          </span>
        </div>
      </header>

      <h1 className="text-center font-terminal text-2xl text-black">{question.prompt}</h1>

      {everyoneAnswered && (
        <p
          role="alert"
          className="animate-blink border-4 border-ink bg-rose-100 px-3 py-2 text-center font-arcade text-[10px] text-rose-600"
        >
          EVERYONE HAS ANSWERED! ENDING ROUND
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {question.options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              disabled={picked !== null}
              aria-pressed={picked === index}
              // A mouse/touch click shouldn't leave the button focused: the
              // "everyone answered" banner that can mount right above once
              // the last pick comes in would otherwise trigger the
              // browser's scroll-to-focused-element correction.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => answer(index)}
              className={cn(
                'flex w-full items-center gap-3 border-4 px-3 py-3 text-left font-terminal text-xl transition-transform',
                picked === index
                  ? 'translate-x-[2px] translate-y-[2px] border-flare bg-selected-sky text-black shadow-none'
                  : cn(
                      'border-ink bg-sky-500 text-white shadow-[2px_2px_0px_0px_#381a41]',
                      'disabled:opacity-60',
                    ),
                'disabled:cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center border-2 font-arcade text-[10px]',
                  picked === index
                    ? 'border-black/40 text-black/70'
                    : 'border-white/70 text-white/70',
                )}
              >
                {LETTERS[index]}
              </span>
              <span>{option}</span>
            </button>
          </li>
        ))}
      </ul>

      {picked !== null && (
        <p role="status" className="animate-blink text-center font-terminal text-lg text-green-600">
          Answer locked. Waiting for the others...
        </p>
      )}
    </RetroContainer>
  );
};
