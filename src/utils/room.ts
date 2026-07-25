import { MAX_PLAYERS, type PlayerSlot, type RoomState } from '@/types';

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

export const isRoomFull = (state: RoomState): boolean => countPlayers(state) >= MAX_PLAYERS;
