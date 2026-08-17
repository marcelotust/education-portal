import { RetroButton } from '@/components/ui/RetroButton';
import { QuizSetupPanel } from '@/features/gameplay/quiz/QuizSetupPanel';
import { StopSetupPanel } from '@/features/gameplay/StopSetupPanel';
import { TabooSetupPanel } from '@/features/gameplay/taboo/TabooSetupPanel';
import { useRoom } from '@/hooks/useRoom';
import { MIN_CATEGORIES } from '@/types';
import { GameCartridgePicker } from './GameCartridgePicker';
import { NewMatchControl } from './NewMatchControl';

/** Write-side of the lobby: only ever rendered for the Host. */
export const HostLobbyControls = () => {
  const { state, dispatch } = useRoom();

  if (state.status === 'LOBBY_IDLE') {
    // Nothing played yet means nothing to zero, so the reset stays hidden.
    const hasPlayed =
      Object.keys(state.scores).length > 0 || Object.keys(state.lastRoundPoints).length > 0;

    return (
      <div className="flex flex-col gap-6">
        <RetroButton tone="yellow" onClick={() => dispatch({ type: 'OPEN_GAME_CONFIG' })}>
          SELECT GAME
        </RetroButton>

        {/* Kept well away from START GAME: a mis-tap here wipes the session. */}
        {hasPlayed && <NewMatchControl onConfirm={() => dispatch({ type: 'MATCH_RESET' })} />}
      </div>
    );
  }

  if (state.status !== 'CONFIGURING_GAME') return null;

  // The Host holds a slot too; at least one other filled slot must belong to
  // a Player, or there's no one to race/answer/guess against.
  const hasAtLeastOnePlayer = state.slots.some((slot) => slot?.role === 'PLAYER');

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
          onSelectQuestionCount={(count) =>
            dispatch({ type: 'QUIZ_QUESTION_COUNT_SELECTED', count })
          }
        />
      )}

      {state.gameSetup.game === 'TABOO' && state.selectedGameId !== null && (
        <TabooSetupPanel
          setup={state.gameSetup}
          onSelectDuration={(seconds) => dispatch({ type: 'ROUND_DURATION_SELECTED', seconds })}
          onToggleCategory={(category) => dispatch({ type: 'CATEGORY_TOGGLED', category })}
        />
      )}

      {!hasAtLeastOnePlayer && (
        <p className="text-center font-terminal text-base text-gray-500">
          Waiting for at least 1 more player to join...
        </p>
      )}

      <RetroButton
        tone="green"
        disabled={
          !hasAtLeastOnePlayer ||
          state.selectedGameId === null ||
          (state.gameSetup.game === 'STOP' && state.gameSetup.categories.length < MIN_CATEGORIES) ||
          (state.gameSetup.game === 'TABOO' && state.gameSetup.categories.length < 1)
        }
        onClick={() => dispatch({ type: 'START_GAME' })}
      >
        START GAME
      </RetroButton>

      <RetroButton tone="cyan" onClick={() => dispatch({ type: 'CANCEL_GAME_CONFIG' })}>
        BACK
      </RetroButton>
    </div>
  );
};
