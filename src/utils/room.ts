import { MAX_PLAYERS, type Player, type PlayerSlot, type RoomEvent, type RoomState } from '@/types';

const PIN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export const PIN_LENGTH = 4;

/**
 * How long a room survives without the Host touching it. Mirrors the expiry
 * sweep in supabase/migrations — change both together.
 */
export const ROOM_LIFETIME_HOURS = 5;

/** Keeps nicknames readable inside a 6-slot grid on a phone screen. */
export const MAX_NICKNAME_LENGTH = 12;

/** Mirrors the CHECK constraint on rooms.pin, so bad input never reaches the API. */
export const isValidPin = (pin: string): boolean =>
  new RegExp(`^[${PIN_ALPHABET}]{${PIN_LENGTH}}$`).test(pin);

/** 4-letter PIN without visually ambiguous characters (I, O). */
export const generateRoomPin = (): string =>
  Array.from({ length: PIN_LENGTH }, () => {
    const index = Math.floor(Math.random() * PIN_ALPHABET.length);
    return PIN_ALPHABET[index] ?? 'A';
  }).join('');

export const createEmptySlots = (): PlayerSlot[] => Array.from({ length: MAX_PLAYERS }, () => null);

export const countPlayers = (state: RoomState): number =>
  state.slots.filter((slot) => slot !== null).length;

/**
 * Everyone at the table: the real people in the slots, then the bot. Use this
 * for what the room shows and plays; `countPlayers` stays the real-people
 * count the join guard needs, so a bot can never turn a person away.
 */
export const seatedPlayers = (state: RoomState): Player[] => {
  const people = state.slots.filter((slot): slot is Player => slot !== null);
  return state.bot === null ? people : [...people, state.bot];
};

export const seatedCount = (state: RoomState): number => seatedPlayers(state).length;

/** The 6-seat board with the bot on the first open seat. */
export const seatedBoard = (state: RoomState): PlayerSlot[] => {
  if (state.bot === null) return [...state.slots];

  const open = state.slots.findIndex((slot) => slot === null);
  return state.slots.map((slot, index) => (index === open ? state.bot : slot));
};

export const isRoomFull = (state: RoomState): boolean => countPlayers(state) >= MAX_PLAYERS;

/** Presence resyncs the whole board on every tick; this is how the FSM skips a no-op update. */
export const sameBoard = (a: readonly PlayerSlot[], b: readonly PlayerSlot[]): boolean =>
  a.length === b.length &&
  a.every((slot, index) => {
    const other = b[index];
    return slot === other || (slot?.id === other?.id && slot?.nickname === other?.nickname);
  });

export const seatPlayer = (
  state: RoomState,
  event: Extract<RoomEvent, { type: 'PLAYER_JOINED' }>,
): RoomState => {
  const openSlot = state.slots.findIndex((slot) => slot === null);
  if (openSlot === -1 || state.slots.length > MAX_PLAYERS) return state;

  const slots = state.slots.map((slot, index) => (index === openSlot ? event.player : slot));
  return { ...state, slots };
};

export const releaseSlot = (state: RoomState, playerId: string): RoomState => {
  const slots = state.slots.map((slot) => (slot?.id === playerId ? null : slot));
  return { ...state, slots };
};

/**
 * Shared by every cartridge that scores itself onto the running total
 * (QUIZ in roomMachine.ts, TABOO in tabooMachine.ts): sums earned points into
 * what a player already has, rather than replacing it.
 */
export const addPoints = (
  total: Readonly<Record<string, number>>,
  earned: Readonly<Record<string, number>>,
): Record<string, number> => {
  const sum = { ...total };
  for (const [playerId, points] of Object.entries(earned)) {
    sum[playerId] = (sum[playerId] ?? 0) + points;
  }
  return sum;
};
