interface RoomPinBannerProps {
  pin: string;
  playerCount: number;
  maxPlayers: number;
}

/** Header of the lobby: the PIN Players type plus the seat counter. */
export const RoomPinBanner = ({ pin, playerCount, maxPlayers }: RoomPinBannerProps) => (
  <header className="mb-5 flex flex-col items-center gap-2">
    <h1 className="text-neon font-arcade text-sm text-arcade-pink">LOBBY</h1>

    <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">Room PIN</p>
    <p className="text-neon font-arcade text-3xl tracking-[0.4em] text-arcade-green">{pin}</p>

    <p className="font-arcade text-[10px] text-arcade-cyan">
      {playerCount}/{maxPlayers} PLAYERS
    </p>
  </header>
);
