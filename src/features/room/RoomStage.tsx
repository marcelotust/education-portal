import type { ReactNode } from 'react';

import { AdBreakScreen } from '@/features/gameplay/AdBreakScreen';
import { RoundValidationScreen } from '@/features/gameplay/RoundValidationScreen';
import { ScoreboardScreen } from '@/features/gameplay/ScoreboardScreen';
import { QuizRevealScreen } from '@/features/gameplay/quiz/QuizRevealScreen';
import { QuizRoundScreen } from '@/features/gameplay/quiz/QuizRoundScreen';
import { StopRoundScreen } from '@/features/gameplay/StopRoundScreen';
import { TabooRevealScreen } from '@/features/gameplay/taboo/TabooRevealScreen';
import { TabooRoundScreen } from '@/features/gameplay/taboo/TabooRoundScreen';
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
      if (state.currentRound?.game === 'QUIZ') return <QuizRoundScreen playerId={playerId} />;
      if (state.currentRound?.game === 'TABOO') return <TabooRoundScreen playerId={playerId} />;
      return <StopRoundScreen playerId={playerId} />;
    case 'SHOWING_ANSWER':
      // Only QUIZ and TABOO pause for a reveal; STOP never reaches this state.
      return state.currentRound?.game === 'TABOO' ? (
        <TabooRevealScreen />
      ) : (
        <QuizRevealScreen playerId={playerId} />
      );
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
