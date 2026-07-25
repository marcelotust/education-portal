import { useCallback, useEffect } from 'react';

import { useAnswerBroadcast } from '@/hooks/useAnswerBroadcast';
import { useCountdown } from '@/hooks/useCountdown';
import { useRoom } from '@/hooks/useRoom';
import type { StopAnswer } from '@/types';
import { StopTypingScreen, type TypedAnswer } from './StopTypingScreen';

interface StopRoundScreenProps {
  playerId: string;
}

/** Runs the typing phase: local clock, own answers out, everyone's answers in. */
export const StopRoundScreen = ({ playerId }: StopRoundScreenProps) => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound;
  const secondsLeft = useCountdown(round?.endsAt ?? null);

  const onAnswers = useCallback(
    ({ playerId: from, answers }: { playerId: string; answers: readonly StopAnswer[] }) =>
      dispatch({ type: 'ANSWERS_SUBMITTED', playerId: from, answers }),
    [dispatch],
  );
  const broadcast = useAnswerBroadcast({ pin: state.pin, onAnswers });

  const handleSubmit = (typed: readonly TypedAnswer[]) => {
    const answers: StopAnswer[] = typed.map(({ category, value }) => ({
      playerId,
      category,
      value,
      isValid: null,
    }));

    dispatch({ type: 'ANSWERS_SUBMITTED', playerId, answers });
    broadcast({ playerId, answers });
  };

  useEffect(() => {
    // Only the Host closes the round, so it happens once for everyone.
    if (isHost && secondsLeft <= 0 && round !== null) dispatch({ type: 'END_ROUND' });
  }, [isHost, secondsLeft, round, dispatch]);

  if (round === null) return null;

  return <StopTypingScreen round={round} secondsLeft={secondsLeft} onSubmit={handleSubmit} />;
};
