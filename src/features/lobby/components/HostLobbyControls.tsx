import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';
import { GameCartridgePicker } from './GameCartridgePicker';

/** Write-side of the lobby: only ever rendered for the Host. */
export const HostLobbyControls = () => {
  const { state, dispatch } = useRoom();

  if (state.status === 'LOBBY_IDLE') {
    return (
      <ArcadeButton tone="pink" onClick={() => dispatch({ type: 'OPEN_GAME_CONFIG' })}>
        SELECT GAME
      </ArcadeButton>
    );
  }

  if (state.status !== 'CONFIGURING_GAME') return null;

  return (
    <div className="flex flex-col gap-3">
      <GameCartridgePicker
        selectedGameId={state.selectedGameId}
        onSelect={(gameId) => dispatch({ type: 'SELECT_GAME', gameId })}
      />

      <ArcadeButton
        tone="green"
        disabled={state.selectedGameId === null}
        onClick={() => dispatch({ type: 'START_GAME' })}
      >
        START GAME
      </ArcadeButton>

      <ArcadeButton tone="cyan" onClick={() => dispatch({ type: 'CANCEL_GAME_CONFIG' })}>
        BACK
      </ArcadeButton>
    </div>
  );
};
