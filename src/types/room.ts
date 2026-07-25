import type { GameId, RoundDuration, StopAnswer, StopRound, StopSetup } from './game';
import type { Player, PlayerRole, PlayerSlot } from './player';

/** Finite State Machine states for a persistent room. */
export type RoomStatus =
  'LOBBY_IDLE' | 'CONFIGURING_GAME' | 'PLAYING_AD' | 'PLAYING' | 'CALCULATING_SCORES';

export interface RoomState {
  /** 4-letter PIN students type to join. */
  pin: string;
  hostId: string;
  status: RoomStatus;
  /** Fixed-length board of 6 slots; `null` means the slot is open. */
  slots: readonly PlayerSlot[];
  /** Cartridge chosen in CONFIGURING_GAME; `null` while none is loaded. */
  selectedGameId: GameId | null;
  /** Only present while the STOP cartridge is running. */
  currentRound: StopRound | null;
  /** Chosen by the Host during CONFIGURING_GAME, watched by everyone. */
  gameSetup: StopSetup;
  /**
   * Points per player id, accumulated across rounds. Kept out of the slots
   * because Presence rebuilds those on every sync and would wipe them.
   */
  scores: Readonly<Record<string, number>>;
}

/** The room row stores everything except the PIN and host, which are columns. */
export type PersistedRoomState = Omit<RoomState, 'pin' | 'hostId'>;

/**
 * Events the FSM understands. Control events (everything except the
 * `PLAYER_*` presence events) are Host-only and are dropped for Clients.
 */
export type RoomEvent =
  | { type: 'OPEN_GAME_CONFIG' }
  | { type: 'CANCEL_GAME_CONFIG' }
  | { type: 'SELECT_GAME'; gameId: GameId }
  | { type: 'ROUND_DURATION_SELECTED'; seconds: RoundDuration }
  | { type: 'CATEGORY_TOGGLED'; category: string }
  | { type: 'START_GAME' }
  | { type: 'AD_FINISHED'; round: StopRound }
  | { type: 'ANSWERS_SUBMITTED'; playerId: string; answers: readonly StopAnswer[] }
  | { type: 'STOP_CALLED'; playerId: string; endsAt: string }
  | { type: 'ANSWER_JUDGED'; playerId: string; category: string; isValid: boolean }
  | { type: 'REMAINING_ANSWERS_APPROVED' }
  | { type: 'ROUND_SCORED' }
  | { type: 'END_ROUND' }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'PLAYERS_SYNCED'; slots: readonly PlayerSlot[] }
  | { type: 'ROOM_STATE_RECEIVED'; state: PersistedRoomState };

export type RoomEventType = RoomEvent['type'];

export interface RoomContextValue {
  state: RoomState;
  /** Role of the local participant; drives write permissions. */
  role: PlayerRole;
  isHost: boolean;
  /** Host-only events dispatched by a Client are ignored. */
  dispatch: (event: RoomEvent) => void;
}
