import { InviteLinkButton } from './InviteLinkButton';

interface RoomPinBannerProps {
  pin: string;
  playerCount: number;
  maxPlayers: number;
  isHost: boolean;
}

/** Header of the lobby: the PIN Players type plus the seat counter. */
export const RoomPinBanner = ({ pin, playerCount, maxPlayers, isHost }: RoomPinBannerProps) => (
  <header className="mb-5 flex flex-col items-center gap-2">
    <h1 className="font-arcade text-xs text-rose-500">LOBBY</h1>

    <p className="font-terminal text-sm uppercase tracking-[0.3em] text-gray-500">Room PIN</p>
    <p className="text-solid-shadow font-arcade text-3xl tracking-[0.3em] text-yellow-400">{pin}</p>

    {isHost && <InviteLinkButton pin={pin} />}

    <p className="border-4 border-black bg-sky-500 px-3 py-2 font-arcade text-[8px] text-white">
      {playerCount}/{maxPlayers} PLAYERS
    </p>
  </header>
);
