/** Who is allowed to write to the room state. */
export type PlayerRole = 'HOST' | 'CLIENT';

/** Arcade avatars are picked from a fixed sprite sheet, one per lobby slot. */
export type AvatarId = 'RED' | 'BLUE' | 'GREEN' | 'PINK' | 'CYAN' | 'YELLOW';

export interface Player {
  /** Supabase anonymous auth user id. */
  id: string;
  nickname: string;
  avatarId: AvatarId;
  role: PlayerRole;
  isReady: boolean;
  score: number;
  /** ISO timestamp, used to keep slot ordering stable across presence syncs. */
  joinedAt: string;
}

/** A lobby slot is either taken by a player or empty (`null`). */
export type PlayerSlot = Player | null;

/** Max players per room, as defined by the MVP. */
export const MAX_PLAYERS = 6;
