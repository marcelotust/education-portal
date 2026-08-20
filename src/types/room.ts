import type {
  GameId,
  GameSetup,
  QuizAnswer,
  QuizQuestionCount,
  Round,
  RoundDuration,
  StopAnswer,
  TabooGuess,
} from './game';
import type { Player, PlayerRole, PlayerSlot } from './player';

/**
 * Finite State Machine states for a persistent room. `SHOWING_ANSWER` is the
 * pause between two turns of a QUIZ or TABOO match; STOP never enters it.
 */
export type RoomStatus =
  | 'LOBBY_IDLE'
  | 'CONFIGURING_GAME'
  | 'PLAYING_AD'
  | 'PLAYING'
  | 'SHOWING_ANSWER'
  | 'CALCULATING_SCORES';

export interface RoomState {
  /** 4-letter PIN Players type to join. */
  pin: string;
  hostId: string;
  status: RoomStatus;
  /** Fixed-length board of 6 slots; `null` means the slot is open. */
  slots: readonly PlayerSlot[];
  /** Cartridge chosen in CONFIGURING_GAME; `null` while none is loaded. */
  selectedGameId: GameId | null;
  /** Only present while the STOP cartridge is running. */
  currentRound: Round | null;
  /** Chosen by the Host during CONFIGURING_GAME, watched by everyone. */
  gameSetup: GameSetup;
  /**
   * Points per player id, accumulated across rounds. Kept out of the slots
   * because Presence rebuilds those on every sync and would wipe them.
   */
  scores: Readonly<Record<string, number>>;
  /**
   * What the last scored round was worth, per player. Kept after returning to
   * the lobby so the result outlives the scoreboard screen.
   */
  lastRoundPoints: Readonly<Record<string, number>>;
}

/** The room row stores everything except the PIN and host, which are columns. */
export type PersistedRoomState = Omit<RoomState, 'pin' | 'hostId'>;

/**
 * Events the FSM understands. Control events (everything except the
 * `PLAYER_*` presence events) are Host-only and are dropped for Players.
 */
export type RoomEvent =
  | { type: 'OPEN_GAME_CONFIG' }
  | { type: 'CANCEL_GAME_CONFIG' }
  | { type: 'SELECT_GAME'; gameId: GameId }
  | { type: 'ROUND_DURATION_SELECTED'; seconds: RoundDuration }
  | { type: 'CATEGORY_TOGGLED'; category: string }
  | { type: 'QUIZ_TOPIC_SELECTED'; topic: string }
  | { type: 'QUIZ_QUESTION_COUNT_SELECTED'; count: QuizQuestionCount }
  /** The Host has finished the reveal: on to the next question, or the end. */
  | { type: 'NEXT_QUESTION'; endsAt: string }
  | { type: 'START_GAME' }
  | { type: 'AD_FINISHED'; round: Round }
  | { type: 'ANSWERS_SUBMITTED'; playerId: string; answers: readonly StopAnswer[] }
  | { type: 'QUIZ_ANSWERED'; answer: QuizAnswer }
  /** Every seated player has picked; pull the deadline in instead of waiting out the clock. */
  | { type: 'QUIZ_ALL_ANSWERED'; endsAt: string }
  /**
   * Broadcast twin of QUIZ_ALL_ANSWERED (#105): same effect, but reaches
   * Players over Broadcast instead of the slower table round trip. Allowed
   * for every client since, like ROOM_STATE_RECEIVED, it only ever applies
   * an endsAt the Host already decided — nobody originates it locally.
   */
  | { type: 'QUIZ_DEADLINE_RECEIVED'; endsAt: string }
  | { type: 'TABOO_GUESSED'; guess: TabooGuess }
  /** Every guesser has answered; pull the deadline in instead of waiting out the clock. */
  | { type: 'TABOO_ALL_GUESSED'; endsAt: string }
  /** The Host has finished the reveal: on to the next clue-giver, or the end. */
  | { type: 'NEXT_TABOO_TURN'; endsAt: string }
  | { type: 'STOP_CALLED'; playerId: string; endsAt: string }
  | { type: 'ANSWER_JUDGED'; playerId: string; category: string; isValid: boolean }
  | { type: 'REMAINING_ANSWERS_APPROVED' }
  | { type: 'ROUND_SCORED' }
  | { type: 'GUESS_JUDGED'; playerId: string; isValid: boolean }
  | { type: 'REMAINING_GUESSES_APPROVED' }
  | { type: 'TURN_SCORED' }
  | { type: 'END_ROUND' }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'MATCH_RESET' }
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
  /** Host-only events dispatched by a Player are ignored. */
  dispatch: (event: RoomEvent) => void;
}
