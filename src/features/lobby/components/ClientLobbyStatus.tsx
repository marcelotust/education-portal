import type { RoomStatus } from '@/types';

const MESSAGES: Partial<Record<RoomStatus, string>> = {
  LOBBY_IDLE: 'Waiting for the Host to start...',
  CONFIGURING_GAME: 'The Host is choosing the game...',
};

interface ClientLobbyStatusProps {
  status: RoomStatus;
}

/** Read-only feedback for Clients; mirrors the FSM without exposing controls. */
export const ClientLobbyStatus = ({ status }: ClientLobbyStatusProps) => {
  const message = MESSAGES[status];
  if (message === undefined) return null;

  return (
    <p className="animate-blink text-center font-terminal text-xl text-arcade-cyan">{message}</p>
  );
};
