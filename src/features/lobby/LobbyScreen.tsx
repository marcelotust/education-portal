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

  return (
    <section className="flex flex-col gap-5">
      <RoomPinBanner
        pin={state.pin}
        playerCount={countPlayers(state)}
        maxPlayers={MAX_PLAYERS}
        isHost={isHost}
      />

      <CharacterSelectGrid slots={state.slots} scores={state.scores} />

      {Object.keys(state.lastRoundPoints).length > 0 && (
        <LastRoundStandings
          players={state.slots.filter((slot): slot is Player => slot !== null)}
          scores={state.scores}
          lastRoundPoints={state.lastRoundPoints}
        />
      )}

      {isHost ? <HostLobbyControls /> : <PlayerLobbyControls />}

      <ArcadeButton tone="cyan" onClick={() => void navigate('/')}>
        BACK TO START
      </ArcadeButton>
    </section>
  );
};
