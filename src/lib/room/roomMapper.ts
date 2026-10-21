import { DEFAULT_STOP_GAME_SETUP } from '@/features/gameplay/stopRound';
import {
  MAX_PLAYERS,
  type PlayerRole,
  type PlayerSlot,
  type RoomState,
  type RoomStatus,
  type StoredPlayerRole,
} from '@/types';
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

/**
 * A room outlives the deploy that renamed the role, so a stored seat can still
 * say `CLIENT`. Read it as what it always meant.
 */
const toRole = (role: StoredPlayerRole): PlayerRole => (role === 'CLIENT' ? 'PLAYER' : role);

/** The board is a contract, not a suggestion: always exactly MAX_PLAYERS seats. */
const toSlots = (slots: readonly PlayerSlot[]): PlayerSlot[] =>
  Array.from({ length: MAX_PLAYERS }, (_, index) => {
    const slot = slots[index] ?? null;
    return slot === null ? null : { ...slot, role: toRole(slot.role) };
  });

/**
 * JSONB is untyped at rest, so a row can always be stale or malformed.
 * Normalising here keeps every consumer of RoomState honest.
 */
export const rowToRoomState = (row: RoomRow): RoomState => ({
  pin: row.pin,
  hostId: row.host_id,
  status: toStatus(row.state.status),
  slots: toSlots(row.state.slots),
  // Rows written before bots existed have none.
  bot: row.state.bot ?? null,
  selectedGameId: row.state.selectedGameId,
  currentRound: row.state.currentRound,
  gameSetup: row.state.gameSetup ?? DEFAULT_STOP_GAME_SETUP,
  // Rows written before scores existed must not crash the scoreboard.
  scores: row.state.scores ?? {},
  lastRoundPoints: row.state.lastRoundPoints ?? {},
});

/** PIN and host live in their own columns; never duplicate them in the payload. */
export const toPersistedState = (state: RoomState): PersistedRoomState => ({
  status: state.status,
  slots: state.slots,
  bot: state.bot,
  selectedGameId: state.selectedGameId,
  currentRound: state.currentRound,
  gameSetup: state.gameSetup,
  scores: state.scores,
  lastRoundPoints: state.lastRoundPoints,
});
