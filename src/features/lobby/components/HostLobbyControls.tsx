import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { QuizSetupPanel } from '@/features/gameplay/quiz/QuizSetupPanel';
import { StopSetupPanel } from '@/features/gameplay/StopSetupPanel';
import { useRoom } from '@/hooks/useRoom';
import { MIN_CATEGORIES } from '@/types';
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

      {state.gameSetup.game === 'STOP' && state.selectedGameId !== null && (
        <StopSetupPanel
          setup={state.gameSetup}
          onSelectDuration={(seconds) => dispatch({ type: 'ROUND_DURATION_SELECTED', seconds })}
          onToggleCategory={(category) => dispatch({ type: 'CATEGORY_TOGGLED', category })}
        />
      )}

      {state.gameSetup.game === 'QUIZ' && state.selectedGameId !== null && (
        <QuizSetupPanel
          setup={state.gameSetup}
          onSelectDuration={(seconds) => dispatch({ type: 'ROUND_DURATION_SELECTED', seconds })}
          onSelectTopic={(topic) => dispatch({ type: 'QUIZ_TOPIC_SELECTED', topic })}
        />
      )}

      <ArcadeButton
        tone="green"
        disabled={
          state.selectedGameId === null ||
          (state.gameSetup.game === 'STOP' && state.gameSetup.categories.length < MIN_CATEGORIES)
        }
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
