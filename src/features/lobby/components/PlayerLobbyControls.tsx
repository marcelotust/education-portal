import { QuizSetupPanel } from '@/features/gameplay/quiz/QuizSetupPanel';
import { StopSetupPanel } from '@/features/gameplay/StopSetupPanel';
import { TabooSetupPanel } from '@/features/gameplay/taboo/TabooSetupPanel';
import { useRoom } from '@/hooks/useRoom';
import { PlayerLobbyStatus } from './PlayerLobbyStatus';
import { GameCartridgePicker } from './GameCartridgePicker';

/**
 * Read-only side of the lobby. Players see everything the Host sees — including
 * the cartridge shelf and which one is picked — without any way to act on it.
 */
export const PlayerLobbyControls = () => {
  const { state } = useRoom();

  return (
    <div className="flex flex-col gap-4">
      <PlayerLobbyStatus status={state.status} />

      {state.status === 'CONFIGURING_GAME' && (
        <>
          <GameCartridgePicker selectedGameId={state.selectedGameId} />
          {state.selectedGameId !== null && state.gameSetup.game === 'STOP' && (
            <StopSetupPanel setup={state.gameSetup} />
          )}
          {state.selectedGameId !== null && state.gameSetup.game === 'QUIZ' && (
            <QuizSetupPanel setup={state.gameSetup} />
          )}
          {state.selectedGameId !== null && state.gameSetup.game === 'TABOO' && (
            <TabooSetupPanel setup={state.gameSetup} />
          )}
        </>
      )}
    </div>
  );
};
