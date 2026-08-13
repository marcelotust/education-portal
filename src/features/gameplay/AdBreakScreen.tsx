import { useEffect, useState } from 'react';

import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { createQuizRound } from './quiz/quizRound';
import { createStopRound } from './stopRound';
import { createTabooRound } from './taboo/tabooRound';

const BREAK_SECONDS = 5;

/** The ad interstitial between the lobby and the round. */
export const AdBreakScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  const [secondsLeft, setSecondsLeft] = useState(BREAK_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [secondsLeft]);

  useEffect(() => {
    if (!isHost || secondsLeft > 0) return;

    // Only the Host draws the round, so everyone plays the same one.
    if (state.gameSetup.game === 'QUIZ') {
      dispatch({ type: 'AD_FINISHED', round: createQuizRound(state.gameSetup) });
    } else if (state.gameSetup.game === 'TABOO') {
      const seated = state.slots
        .filter((slot): slot is Player => slot !== null)
        .map((player) => player.id);
      dispatch({ type: 'AD_FINISHED', round: createTabooRound(state.gameSetup, seated) });
    } else {
      dispatch({ type: 'AD_FINISHED', round: createStopRound(state.gameSetup) });
    }
  }, [isHost, secondsLeft, state.gameSetup, state.slots, dispatch]);

  return (
    <section className="flex flex-col items-center gap-6 py-10 text-center">
      <h1 className="text-neon font-arcade text-sm text-arcade-pink">GET READY</h1>

      <p className="font-arcade text-6xl text-arcade-yellow" data-testid="ad-countdown">
        {secondsLeft > 0 ? secondsLeft : 'GO!'}
      </p>

      <p className="font-terminal text-lg text-slate-400">
        Loading cartridge {state.selectedGameId ?? ''}...
      </p>
    </section>
  );
};
