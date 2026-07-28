import type { RoomStatus } from '@/types';

const MESSAGES: Partial<Record<RoomStatus, string>> = {
  LOBBY_IDLE: 'Waiting for the Host to start...',
  CONFIGURING_GAME: 'The Host is choosing the game...',
};

interface PlayerLobbyStatusProps {
  status: RoomStatus;
}

/** Read-only feedback for Players; mirrors the FSM without exposing controls. */
export const PlayerLobbyStatus = ({ status }: PlayerLobbyStatusProps) => {
  const message = MESSAGES[status];
  if (message === undefined) return null;

  return (
    <p className="animate-blink text-center font-terminal text-xl text-arcade-cyan">{message}</p>
  );
};
