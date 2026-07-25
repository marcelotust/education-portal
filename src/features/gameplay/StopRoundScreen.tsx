import { useCallback, useEffect } from 'react';

import { useAnswerBroadcast } from '@/hooks/useAnswerBroadcast';
import { useCountdown } from '@/hooks/useCountdown';
import { useRoom } from '@/hooks/useRoom';
import type { StopAnswer } from '@/types';
import { StopTypingScreen, type TypedAnswer } from './StopTypingScreen';

/**
 * Breathing room between somebody calling STOP and the round closing, so every
 * other screen has time to auto-submit what was typed.
 */
const STOP_GRACE_MS = 5000;

interface StopRoundScreenProps {
  playerId: string;
}

/** Runs the typing phase: local clock, own answers out, everyone's answers in. */
export const StopRoundScreen = ({ playerId }: StopRoundScreenProps) => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound?.game === 'STOP' ? state.currentRound : null;
  const secondsLeft = useCountdown(round?.endsAt ?? null);

  const onAnswers = useCallback(
    ({ playerId: from, answers }: { playerId: string; answers: readonly StopAnswer[] }) =>
      dispatch({ type: 'ANSWERS_SUBMITTED', playerId: from, answers }),
    [dispatch],
  );

  const onStopCalled = useCallback(
    (calledBy: string) => {
      // Only the Host writes the room, so only it turns a STOP into a deadline.
      if (isHost) {
        dispatch({
          type: 'STOP_CALLED',
          playerId: calledBy,
          endsAt: new Date(Date.now() + STOP_GRACE_MS).toISOString(),
        });
      }
    },
    [isHost, dispatch],
  );

  const channel = useAnswerBroadcast({ pin: state.pin, onAnswers, onStopCalled });

  const handleSubmit = (typed: readonly TypedAnswer[], calledStop: boolean) => {
    const answers: StopAnswer[] = typed.map(({ category, value }) => ({
      playerId,
      category,
      value,
      isValid: null,
    }));

    dispatch({ type: 'ANSWERS_SUBMITTED', playerId, answers });
    channel.sendAnswers({ playerId, answers });

    // Filling every category is what earns the right to end the round.
    if (calledStop) {
      channel.callStop(playerId);
      onStopCalled(playerId);
    }
  };

  useEffect(() => {
    // Only the Host closes the round, so it happens once for everyone.
    if (isHost && secondsLeft <= 0 && round !== null) dispatch({ type: 'END_ROUND' });
  }, [isHost, secondsLeft, round, dispatch]);

  if (round === null) return null;

  const caller = state.slots.find((slot) => slot?.id === round.stoppedBy);

  return (
    <StopTypingScreen
      round={round}
      secondsLeft={secondsLeft}
      stoppedByNickname={caller?.nickname}
      onSubmit={handleSubmit}
    />
  );
};
