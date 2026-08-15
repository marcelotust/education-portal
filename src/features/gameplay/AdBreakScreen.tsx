import { useEffect, useState } from 'react';

import { InlineAdSlot } from '@/components/layout/InlineAdSlot';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { createQuizRound } from './quiz/quizRound';
import { createStopRound } from './stopRound';
import { createTabooRound } from './taboo/tabooRound';

// Nobody is playing yet, so this is the one screen an ad costs nothing (#18).
// Long enough for a slot to render before GO! — 5s wasn't.
const BREAK_SECONDS = 8;

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
    let isCurrent = true;

    // Only the Host draws the round, so everyone plays the same one. QUIZ and
    // TABOO fetch their content from Postgres (#34), so drawing is async;
    // `isCurrent` drops a result that resolves after this effect re-runs.
    const draw = async () => {
      if (state.gameSetup.game === 'QUIZ') {
        const round = await createQuizRound(state.gameSetup);
        if (isCurrent) dispatch({ type: 'AD_FINISHED', round });
      } else if (state.gameSetup.game === 'TABOO') {
        const seated = state.slots
          .filter((slot): slot is Player => slot !== null)
          .map((player) => player.id);
        const round = await createTabooRound(state.gameSetup, seated);
        if (isCurrent) dispatch({ type: 'AD_FINISHED', round });
      } else {
        dispatch({ type: 'AD_FINISHED', round: createStopRound(state.gameSetup) });
      }
    };

    void draw();

    return () => {
      isCurrent = false;
    };
  }, [isHost, secondsLeft, state.gameSetup, state.slots, dispatch]);

  return (
    <RetroContainer className="flex flex-col items-center gap-6 p-6 py-10 text-center">
      <h1 className="font-arcade text-sm text-rose-500">GET READY</h1>

      <p
        className="text-solid-shadow font-arcade text-6xl text-yellow-400"
        data-testid="ad-countdown"
      >
        {secondsLeft > 0 ? secondsLeft : 'GO!'}
      </p>

      <p className="font-terminal text-lg text-gray-600">Loading {state.selectedGameId ?? ''}...</p>

      <InlineAdSlot label="AD SPACE" />
    </RetroContainer>
  );
};
