import { MAX_PLAYERS, type AvatarId, type Player, type StopRound } from '@/types';
import { DEFAULT_STOP_SETUP } from '@/features/gameplay/stopRound';
import type { RoomState } from '@/types';

const AVATARS: readonly AvatarId[] = ['RED', 'BLUE', 'GREEN', 'PINK', 'CYAN', 'YELLOW'];

const NICKNAMES = ['ANA', 'BRUNO', 'CAIO', 'DUDA', 'ELIS', 'FABIO'] as const;

export const makePlayer = (index: number, overrides: Partial<Player> = {}): Player => ({
  id: `player-${index}`,
  nickname: NICKNAMES[index % NICKNAMES.length] ?? `P${index}`,
  avatarId: AVATARS[index % AVATARS.length] ?? 'RED',
  role: 'CLIENT',
  isReady: true,
  joinedAt: new Date(2026, 0, 1, 10, index).toISOString(),
  ...overrides,
});

export const makeRound = (overrides: Partial<StopRound> = {}): StopRound => ({
  phase: 'TYPING_PHASE',
  letter: 'B',
  categories: ['ANIMAL', 'FOOD'],
  answers: [],
  stoppedBy: null,
  endsAt: '2026-07-24T12:01:00.000Z',
  isScored: false,
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
    gameSetup: DEFAULT_STOP_SETUP,
    scores: {},
  };
};
