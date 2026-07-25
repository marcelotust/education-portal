import { AdBreakScreen } from '@/features/gameplay/AdBreakScreen';
import { RoundValidationScreen } from '@/features/gameplay/RoundValidationScreen';
import { ScoreboardScreen } from '@/features/gameplay/ScoreboardScreen';
import { StopRoundScreen } from '@/features/gameplay/StopRoundScreen';
import { LobbyScreen } from '@/features/lobby/LobbyScreen';
import { useRoom } from '@/hooks/useRoom';

interface RoomStageProps {
  playerId: string;
}

/** Renders whichever screen the FSM state calls for. */
export const RoomStage = ({ playerId }: RoomStageProps) => {
  const { state } = useRoom();

  switch (state.status) {
    case 'LOBBY_IDLE':
    case 'CONFIGURING_GAME':
      return <LobbyScreen />;
    case 'PLAYING_AD':
      return <AdBreakScreen />;
    case 'PLAYING':
      return <StopRoundScreen playerId={playerId} />;
    case 'CALCULATING_SCORES':
      // The Host judges first; the standings replace the table once confirmed.
      return state.currentRound?.isScored === true ? (
        <ScoreboardScreen />
      ) : (
        <RoundValidationScreen />
      );
  }
};
