import type { Player, RoomState } from '@/types';
import { createEmptySlots } from '@/utils/room';

const MOCK_PLAYERS: readonly Player[] = [
  {
    id: 'player-1',
    nickname: 'ANA',
    avatarId: 'PINK',
    role: 'CLIENT',
    isReady: true,
    score: 0,
    joinedAt: '2026-07-24T12:00:00.000Z',
  },
  {
    id: 'player-2',
    nickname: 'BRUNO',
    avatarId: 'CYAN',
    role: 'CLIENT',
    isReady: false,
    score: 0,
    joinedAt: '2026-07-24T12:01:00.000Z',
  },
  {
    id: 'player-3',
    nickname: 'CAIO',
    avatarId: 'YELLOW',
    role: 'CLIENT',
    isReady: true,
    score: 0,
    joinedAt: '2026-07-24T12:02:00.000Z',
  },
];

/** Placeholder room used until the Supabase Realtime layer lands. */
export const createMockRoom = (): RoomState => {
  const slots = createEmptySlots();
  MOCK_PLAYERS.forEach((player, index) => {
    slots[index] = player;
  });

  return {
    pin: 'KPZT',
    hostId: 'host-1',
    status: 'LOBBY_IDLE',
    slots,
    selectedGameId: null,
    currentRound: null,
  };
};
