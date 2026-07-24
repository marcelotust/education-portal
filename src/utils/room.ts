import { MAX_PLAYERS, type PlayerSlot, type RoomState } from '@/types';

const PIN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const PIN_LENGTH = 4;

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
