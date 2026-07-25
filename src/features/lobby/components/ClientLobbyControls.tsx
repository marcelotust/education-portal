import { QuizSetupPanel } from '@/features/gameplay/quiz/QuizSetupPanel';
import { StopSetupPanel } from '@/features/gameplay/StopSetupPanel';
import { useRoom } from '@/hooks/useRoom';
import { ClientLobbyStatus } from './ClientLobbyStatus';
import { GameCartridgePicker } from './GameCartridgePicker';

/**
 * Read-only side of the lobby. Clients see everything the Host sees — including
 * the cartridge shelf and which one is picked — without any way to act on it.
 */
export const ClientLobbyControls = () => {
  const { state } = useRoom();

  return (
    <div className="flex flex-col gap-4">
      <ClientLobbyStatus status={state.status} />

      {state.status === 'CONFIGURING_GAME' && (
        <>
          <GameCartridgePicker selectedGameId={state.selectedGameId} />
          {state.selectedGameId !== null && state.gameSetup.game === 'STOP' && (
            <StopSetupPanel setup={state.gameSetup} />
          )}
          {state.selectedGameId !== null && state.gameSetup.game === 'QUIZ' && (
            <QuizSetupPanel setup={state.gameSetup} />
          )}
        </>
      )}
    </div>
  );
};
