import { useCallback, useEffect, useState } from 'react';

import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { RetroInput } from '@/components/ui/RetroInput';
import type { StopRound } from '@/types';
import { cn } from '@/utils/cn';

/** One typed field, before it becomes a judged StopAnswer. */
export interface TypedAnswer {
  category: string;
  value: string;
}

/** Three bands the closing seconds are shown in, so the pressure is visible. */
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

interface StopTypingScreenProps {
  round: StopRound;
  secondsLeft: number;
  /** Set once somebody called STOP, so everyone knows why the clock jumped. */
  stoppedByNickname?: string | undefined;
  /** `calledStop` is true only when the player finished and hit STOP. */
  onSubmit: (answers: readonly TypedAnswer[], calledStop: boolean) => void;
}

export const StopTypingScreen = ({
  round,
  secondsLeft,
  stoppedByNickname,
  onSubmit,
}: StopTypingScreenProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const submit = useCallback(
    (calledStop: boolean) => {
      if (hasSubmitted) return;
      setHasSubmitted(true);
      onSubmit(
        round.categories.map((category) => ({
          category,
          value: (values[category] ?? '').trim().toUpperCase(),
        })),
        calledStop,
      );
    },
    [hasSubmitted, onSubmit, round.categories, values],
  );

  useEffect(() => {
    // The clock is external state; when it hits zero nothing typed is lost.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (secondsLeft <= 0) submit(false);
  }, [secondsLeft, submit]);

  // Classic STOP: only the player who filled everything may call it.
  const missing = round.categories.filter(
    (category) => (values[category] ?? '').trim() === '',
  ).length;

  return (
    <RetroContainer className="flex flex-col gap-4 p-6">
      {/* Sticky: with eight categories the fields scroll, and losing sight of
          the clock in a timed game is losing the game. */}
      <header className="sticky top-0 z-10 -mx-6 -mt-6 flex items-center justify-between gap-3 border-b-4 border-black bg-white/95 px-6 py-2 backdrop-blur">
        <div className="flex flex-col items-center">
          <span className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">
            Letter
          </span>
          <span
            data-testid="round-letter"
            className="text-solid-shadow font-arcade text-4xl text-yellow-400"
          >
            {round.letter}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">
            Time
          </span>
          <span
            data-testid="round-timer"
            data-urgency={urgencyFor(secondsLeft)}
            className={cn(
              'font-arcade text-2xl transition-transform duration-300',
              URGENCY_STYLES[urgencyFor(secondsLeft)],
            )}
          >
            {secondsLeft}
          </span>
        </div>
      </header>

      {round.stoppedBy !== null && (
        <p
          role="alert"
          className="animate-blink border-4 border-black bg-rose-100 px-3 py-2 text-center font-arcade text-[10px] text-rose-600"
        >
          {stoppedByNickname ?? 'SOMEBODY'} CALLED STOP! LAST SECONDS
        </p>
      )}

      <div className="flex flex-col gap-3">
        {round.categories.map((category) => (
          <RetroInput
            key={category}
            label={category}
            value={values[category] ?? ''}
            disabled={hasSubmitted}
            autoComplete="off"
            maxLength={24}
            onChange={(event) =>
              setValues((current) => ({ ...current, [category]: event.target.value }))
            }
          />
        ))}
      </div>

      {missing > 0 && !hasSubmitted && (
        <p role="status" className="text-center font-terminal text-lg text-gray-500">
          {missing} to go before you can call STOP
        </p>
      )}

      <RetroButton tone="pink" disabled={hasSubmitted || missing > 0} onClick={() => submit(true)}>
        {hasSubmitted ? 'ANSWERS SENT' : 'STOP!'}
      </RetroButton>
    </RetroContainer>
  );
};
