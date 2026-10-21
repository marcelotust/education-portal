import { RetroButton } from '@/components/ui/RetroButton';
import { useRoom } from '@/hooks/useRoom';
import { trackBotAdded } from '@/lib/analytics';
import { MAX_PLAYERS } from '@/types';
import { countPlayers } from '@/utils/room';

/**
 * Seats or removes the one bot (#155). Hidden when six people hold every seat:
 * a bot never competes with a person for one.
 */
export const BotControl = () => {
  const { state, dispatch } = useRoom();

  if (state.bot !== null) {
    return (
      <RetroButton tone="cyan" onClick={() => dispatch({ type: 'REMOVE_BOT' })}>
        REMOVE BOT
      </RetroButton>
    );
  }

  if (countPlayers(state) >= MAX_PLAYERS) return null;

  return (
    <RetroButton
      tone="cyan"
      onClick={() => {
        trackBotAdded();
        dispatch({ type: 'ADD_BOT' });
      }}
    >
      ADD BOT
    </RetroButton>
  );
};
