import { useCallback, useEffect, useRef, useState } from 'react';

import { useCountdown } from '@/hooks/useCountdown';
import { useRoom } from '@/hooks/useRoom';
import { cn } from '@/utils/cn';
import { currentQuestion, hasAnswered } from './quizRound';

const LETTERS = ['A', 'B', 'C', 'D'];

const urgencyFor = (secondsLeft: number): 'calm' | 'warning' | 'critical' => {
  if (secondsLeft <= 5) return 'critical';
  if (secondsLeft <= 10) return 'warning';
  return 'calm';
};

const URGENCY_STYLES = {
  calm: 'text-arcade-cyan',
  warning: 'text-arcade-yellow scale-110',
  critical: 'animate-blink text-arcade-pink scale-125',
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

  useEffect(() => {
    shownAt.current = Date.now();
  }, [questionIndex]);

  useEffect(() => {
    // Only the Host closes the round, so it happens once for everyone.
    if (isHost && secondsLeft <= 0 && round !== null) dispatch({ type: 'END_ROUND' });
  }, [isHost, secondsLeft, round, dispatch]);

  const answer = useCallback(
    (choice: number) => {
      if (round === null || picked !== null || hasAnswered(round, playerId)) return;
      setPick({ questionIndex, choice });
      dispatch({
        type: 'QUIZ_ANSWERED',
        answer: { playerId, choice, elapsedMs: Date.now() - shownAt.current },
      });
    },
    [round, picked, questionIndex, playerId, dispatch],
  );

  const question = round === null ? undefined : currentQuestion(round);
  if (round === null || question === undefined) return null;

  const urgency = urgencyFor(secondsLeft);

  return (
    <section className="flex flex-col gap-5">
      <header className="sticky top-0 z-10 -mx-1 flex items-center justify-between gap-3 bg-slate-900/95 px-1 py-2 backdrop-blur">
        <div className="flex flex-col items-center">
          <span className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
            Question
          </span>
          <span data-testid="question-progress" className="font-arcade text-sm text-arcade-green">
            {questionIndex + 1}/{round.questions.length}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
            Time
          </span>
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

      <h1 className="text-center font-terminal text-2xl text-slate-100">{question.prompt}</h1>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              disabled={picked !== null}
              aria-pressed={picked === index}
              onClick={() => answer(index)}
              className={cn(
                'flex w-full items-center gap-3 rounded border-2 px-3 py-3 text-left font-terminal text-xl transition-colors',
                picked === index
                  ? 'border-arcade-cyan bg-arcade-cyan/15 text-arcade-cyan disabled:border-arcade-cyan disabled:text-arcade-cyan'
                  : 'border-slate-700 text-slate-200',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              <span className="font-arcade text-[10px] text-slate-500">{LETTERS[index]}</span>
              {option}
            </button>
          </li>
        ))}
      </ul>

      {picked !== null && (
        <p
          role="status"
          className="animate-blink text-center font-terminal text-lg text-arcade-green"
        >
          Answer locked. Waiting for the others...
        </p>
      )}
    </section>
  );
};
