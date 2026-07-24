import { MAX_PLAYERS, type AvatarId, type Player } from '@/types';
import type { RoomState } from '@/types';

const AVATARS: readonly AvatarId[] = ['RED', 'BLUE', 'GREEN', 'PINK', 'CYAN', 'YELLOW'];

const NICKNAMES = ['ANA', 'BRUNO', 'CAIO', 'DUDA', 'ELIS', 'FABIO'] as const;

export const makePlayer = (index: number, overrides: Partial<Player> = {}): Player => ({
  id: `player-${index}`,
  nickname: NICKNAMES[index % NICKNAMES.length] ?? `P${index}`,
  avatarId: AVATARS[index % AVATARS.length] ?? 'RED',
  role: 'CLIENT',
  isReady: true,
  score: 0,
  joinedAt: new Date(2026, 0, 1, 10, index).toISOString(),
  ...overrides,
});

interface MakeRoomOptions {
  playerCount?: number;
  status?: RoomState['status'];
}

/** Mock room used by the specs while the Supabase layer does not exist yet. */
export const makeRoom = ({
  playerCount = 3,
  status = 'LOBBY_IDLE',
}: MakeRoomOptions = {}): RoomState => {
  const slots = Array.from({ length: MAX_PLAYERS }, (_, index) =>
    index < playerCount ? makePlayer(index) : null,
  );

  return {
    pin: 'ABCD',
    hostId: 'host-1',
    status,
    slots,
    selectedGameId: null,
    currentRound: null,
  };
};
