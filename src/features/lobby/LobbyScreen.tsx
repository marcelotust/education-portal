import { useRoom } from '@/hooks/useRoom';
import { MAX_PLAYERS } from '@/types';
import { countPlayers } from '@/utils/room';
import { CharacterSelectGrid } from './components/CharacterSelectGrid';
import { ClientLobbyStatus } from './components/ClientLobbyStatus';
import { HostLobbyControls } from './components/HostLobbyControls';
import { RoomPinBanner } from './components/RoomPinBanner';

/** Lobby screen: 6-slot character select plus the role-aware action area. */
export const LobbyScreen = () => {
  const { state, isHost } = useRoom();

  return (
    <section className="flex flex-col gap-5">
      <RoomPinBanner pin={state.pin} playerCount={countPlayers(state)} maxPlayers={MAX_PLAYERS} />

      <CharacterSelectGrid slots={state.slots} />

      {isHost ? <HostLobbyControls /> : <ClientLobbyStatus status={state.status} />}
    </section>
  );
};
