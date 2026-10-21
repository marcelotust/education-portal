import { AVATARS } from '@/lib/room/presence';
import { MAX_PLAYERS, type Player, type RoomState } from '@/types';
import { countPlayers } from '@/utils/room';

export const BOT_ID = 'bot:1';

const makeBot = (seat: number): Player => ({
  id: BOT_ID,
  nickname: 'BOT',
  avatarId: AVATARS[seat % AVATARS.length] ?? 'CYAN',
  role: 'PLAYER',
  isReady: true,
  // The bot never really joined; a fixed time keeps the reducer pure.
  joinedAt: new Date(0).toISOString(),
  isBot: true,
});

/** Only from the lobby: a bot cannot appear or vanish in the middle of a round. */
const inLobby = (state: RoomState): boolean =>
  state.status === 'LOBBY_IDLE' || state.status === 'CONFIGURING_GAME';

export const addBot = (state: RoomState): RoomState => {
  if (!inLobby(state) || state.bot !== null) return state;
  // A seat the bot would take belongs to a person first.
  if (countPlayers(state) >= MAX_PLAYERS) return state;

  return { ...state, bot: makeBot(countPlayers(state)) };
};

export const removeBot = (state: RoomState): RoomState =>
  inLobby(state) && state.bot !== null ? { ...state, bot: null } : state;

/**
 * Real Players win seats. If the board fills with people, the bot makes room
 * instead of turning anyone away.
 */
export const yieldSeatToPlayers = (state: RoomState): RoomState =>
  state.bot !== null && countPlayers(state) >= MAX_PLAYERS ? { ...state, bot: null } : state;
