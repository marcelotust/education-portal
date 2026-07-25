import { useCallback, useEffect, useState } from 'react';

import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { ArcadeInput } from '@/components/ui/ArcadeInput';
import type { StopRound } from '@/types';

/** One typed field, before it becomes a judged StopAnswer. */
export interface TypedAnswer {
  category: string;
  value: string;
}

interface StopTypingScreenProps {
  round: StopRound;
  secondsLeft: number;
  /** `calledStop` is true only when the player finished and hit STOP. */
  onSubmit: (answers: readonly TypedAnswer[], calledStop: boolean) => void;
}

export const StopTypingScreen = ({ round, secondsLeft, onSubmit }: StopTypingScreenProps) => {
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
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-center">
          <span className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
            Letter
          </span>
          <span
            data-testid="round-letter"
            className="text-neon font-arcade text-4xl text-arcade-yellow"
          >
            {round.letter}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
            Time
          </span>
          <span
            data-testid="round-timer"
            className={`font-arcade text-2xl ${secondsLeft <= 10 ? 'animate-blink text-arcade-pink' : 'text-arcade-cyan'}`}
          >
            {secondsLeft}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {round.categories.map((category) => (
          <ArcadeInput
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
        <p role="status" className="text-center font-terminal text-lg text-slate-500">
          {missing} to go before you can call STOP
        </p>
      )}

      <ArcadeButton tone="pink" disabled={hasSubmitted || missing > 0} onClick={() => submit(true)}>
        {hasSubmitted ? 'ANSWERS SENT' : 'STOP!'}
      </ArcadeButton>
    </section>
  );
};
