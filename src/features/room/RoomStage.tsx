import { AdBreakScreen } from '@/features/gameplay/AdBreakScreen';
import { RoundResultsScreen } from '@/features/gameplay/RoundResultsScreen';
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
      return <RoundResultsScreen />;
  }
};
