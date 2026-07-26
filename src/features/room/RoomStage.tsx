import type { ReactNode } from 'react';

import { AdBreakScreen } from '@/features/gameplay/AdBreakScreen';
import { RoundValidationScreen } from '@/features/gameplay/RoundValidationScreen';
import { ScoreboardScreen } from '@/features/gameplay/ScoreboardScreen';
import { QuizRevealScreen } from '@/features/gameplay/quiz/QuizRevealScreen';
import { QuizRoundScreen } from '@/features/gameplay/quiz/QuizRoundScreen';
import { StopRoundScreen } from '@/features/gameplay/StopRoundScreen';
import { LobbyScreen } from '@/features/lobby/LobbyScreen';
import { useRoom } from '@/hooks/useRoom';
import type { RoomState } from '@/types';
import { HostAwayOverlay } from './HostAwayOverlay';

/** Maps the FSM state to a screen. Not a component: it holds no state of its own. */
const screenFor = (state: RoomState, playerId: string): ReactNode => {
  switch (state.status) {
    case 'LOBBY_IDLE':
    case 'CONFIGURING_GAME':
      return <LobbyScreen />;
    case 'PLAYING_AD':
      return <AdBreakScreen />;
    case 'PLAYING':
      return state.currentRound?.game === 'QUIZ' ? (
        <QuizRoundScreen playerId={playerId} />
      ) : (
        <StopRoundScreen playerId={playerId} />
      );
    case 'SHOWING_ANSWER':
      // Only QUIZ pauses between questions; STOP never reaches this state.
      return <QuizRevealScreen />;
    case 'CALCULATING_SCORES':
      // The Host judges first; the standings replace the table once confirmed.
      return state.currentRound?.isScored === true ? (
        <ScoreboardScreen />
      ) : (
        <RoundValidationScreen />
      );
  }
};

interface RoomStageProps {
  playerId: string;
}

/** Renders whichever screen the FSM state calls for, plus the Host-away notice. */
export const RoomStage = ({ playerId }: RoomStageProps) => {
  const { state } = useRoom();

  return (
    <>
      {screenFor(state, playerId)}
      <HostAwayOverlay />
    </>
  );
};
