import { MAX_PLAYERS, type AvatarId, type Player, type PlayerRole, type PlayerSlot } from '@/types';

/** What each participant broadcasts about itself on the room channel. */
export interface PresencePayload {
  playerId: string;
  nickname: string;
  role: PlayerRole;
  joinedAt: string;
}

/** Seat colour is derived from the seat, so two players never share one. */
const AVATARS: readonly AvatarId[] = ['GREEN', 'PINK', 'CYAN', 'YELLOW', 'RED', 'BLUE'];

const toPlayer = (payload: PresencePayload, seat: number, hostId: string): Player => ({
  id: payload.playerId,
  nickname: payload.nickname,
  avatarId: AVATARS[seat % AVATARS.length] ?? 'GREEN',
  // The room row decides who hosts; a client cannot promote itself by lying.
  role: payload.playerId === hostId ? 'HOST' : 'PLAYER',
  isReady: true,
  joinedAt: payload.joinedAt,
});

/**
 * Turns the live presence state into the fixed 6-slot board: Host first, then
 * Players by join time, one seat per player no matter how many tabs are open.
 */
export const buildSlotsFromPresence = (
  payloads: readonly PresencePayload[],
  hostId: string,
): PlayerSlot[] => {
  const unique = new Map<string, PresencePayload>();
  for (const payload of payloads) {
    const seen = unique.get(payload.playerId);
    if (seen === undefined || payload.joinedAt < seen.joinedAt) {
      unique.set(payload.playerId, payload);
    }
  }

  const ordered = [...unique.values()].sort((a, b) => {
    if (a.playerId === hostId) return -1;
    if (b.playerId === hostId) return 1;
    return a.joinedAt.localeCompare(b.joinedAt);
  });

  return Array.from({ length: MAX_PLAYERS }, (_, seat) => {
    const payload = ordered[seat];
    return payload === undefined ? null : toPlayer(payload, seat, hostId);
  });
};
