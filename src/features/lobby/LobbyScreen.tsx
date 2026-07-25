import { useRoom } from '@/hooks/useRoom';
import { MAX_PLAYERS } from '@/types';
import { countPlayers } from '@/utils/room';
import { CharacterSelectGrid } from './components/CharacterSelectGrid';
import { ClientLobbyControls } from './components/ClientLobbyControls';
import { HostLobbyControls } from './components/HostLobbyControls';
import { RoomPinBanner } from './components/RoomPinBanner';

/** Lobby screen: the 6-slot board plus the role-aware action area. */
export const LobbyScreen = () => {
  const { state, isHost } = useRoom();

  return (
    <section className="flex flex-col gap-5">
      <RoomPinBanner pin={state.pin} playerCount={countPlayers(state)} maxPlayers={MAX_PLAYERS} />

      <CharacterSelectGrid slots={state.slots} />

      {isHost ? <HostLobbyControls /> : <ClientLobbyControls />}
    </section>
  );
};
