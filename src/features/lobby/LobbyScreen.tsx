import { useNavigate } from 'react-router-dom';

import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';
import { MAX_PLAYERS, type Player } from '@/types';
import { countPlayers } from '@/utils/room';
import { CharacterSelectGrid } from './components/CharacterSelectGrid';
import { LastRoundStandings } from './components/LastRoundStandings';
import { PlayerLobbyControls } from './components/PlayerLobbyControls';
import { HostLobbyControls } from './components/HostLobbyControls';
import { RoomPinBanner } from './components/RoomPinBanner';

/** Lobby screen: the 6-slot board plus the role-aware action area. */
export const LobbyScreen = () => {
  const { state, isHost } = useRoom();
  const navigate = useNavigate();

  // The Host scrolls past the board on purpose, tapping through the picker down to
  // START GAME. A Player has nothing to click, so put the setup they're watching
  // above the board instead of burying it below three rows of slots.
  const setupFirst = !isHost && state.status === 'CONFIGURING_GAME';

  const board = (
    <>
      <CharacterSelectGrid slots={state.slots} scores={state.scores} />

      {Object.keys(state.lastRoundPoints).length > 0 && (
        <LastRoundStandings
          players={state.slots.filter((slot): slot is Player => slot !== null)}
          scores={state.scores}
          lastRoundPoints={state.lastRoundPoints}
        />
      )}
    </>
  );

  const controls = isHost ? <HostLobbyControls /> : <PlayerLobbyControls />;

  return (
    <section className="flex flex-col gap-5">
      <RoomPinBanner
        pin={state.pin}
        playerCount={countPlayers(state)}
        maxPlayers={MAX_PLAYERS}
        isHost={isHost}
      />

      {setupFirst ? (
        <>
          {controls}
          {board}
        </>
      ) : (
        <>
          {board}
          {controls}
        </>
      )}

      <ArcadeButton tone="cyan" onClick={() => void navigate('/')}>
        BACK TO START
      </ArcadeButton>
    </section>
  );
};
