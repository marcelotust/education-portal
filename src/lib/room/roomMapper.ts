import { MAX_PLAYERS, type PlayerSlot, type RoomState, type RoomStatus } from '@/types';
import type { PersistedRoomState, RoomRow } from '@/types/database';

const ROOM_STATUSES: readonly RoomStatus[] = [
  'LOBBY_IDLE',
  'CONFIGURING_GAME',
  'PLAYING_AD',
  'PLAYING',
  'CALCULATING_SCORES',
];

const toStatus = (value: RoomStatus): RoomStatus =>
  ROOM_STATUSES.includes(value) ? value : 'LOBBY_IDLE';

/** The board is a contract, not a suggestion: always exactly MAX_PLAYERS seats. */
const toSlots = (slots: readonly PlayerSlot[]): PlayerSlot[] =>
  Array.from({ length: MAX_PLAYERS }, (_, index) => slots[index] ?? null);

/**
 * JSONB is untyped at rest, so a row can always be stale or malformed.
 * Normalising here keeps every consumer of RoomState honest.
 */
export const rowToRoomState = (row: RoomRow): RoomState => ({
  pin: row.pin,
  hostId: row.host_id,
  status: toStatus(row.state.status),
  slots: toSlots(row.state.slots),
  selectedGameId: row.state.selectedGameId,
  currentRound: row.state.currentRound,
  // Rows written before scores existed must not crash the scoreboard.
  scores: row.state.scores ?? {},
});

/** PIN and host live in their own columns; never duplicate them in the payload. */
export const toPersistedState = (state: RoomState): PersistedRoomState => ({
  status: state.status,
  slots: state.slots,
  selectedGameId: state.selectedGameId,
  currentRound: state.currentRound,
  scores: state.scores,
});
