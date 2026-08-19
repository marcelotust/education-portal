import { DEFAULT_STOP_GAME_SETUP } from '@/features/gameplay/stopRound';
import { MAX_PLAYERS, type AvatarId, type Player } from '@/types';
import { toJson, type RoomRow } from '@/types/database';
import { RoomJoinError, type RoomService, type RoomSession } from '@/types/roomService';
import { ROOM_LIFETIME_HOURS, countPlayers, generateRoomPin } from '@/utils/room';
import { trackRoomCreated, trackRoomJoined } from '../analytics';
import { ensureAnonymousSession } from '../auth';
import { getSupabaseClient, type EduPartyClient } from '../supabase';
import { rowToRoomState, toPersistedState } from './roomMapper';

const AVATARS: readonly AvatarId[] = ['GREEN', 'PINK', 'CYAN', 'YELLOW', 'RED', 'BLUE'];

/** Postgres unique_violation: two Hosts drew the same PIN at the same time. */
const UNIQUE_VIOLATION = '23505';

const PIN_ATTEMPTS = 5;

const makePlayer = (id: string, nickname: string, seat: number, isHost: boolean): Player => ({
  id,
  nickname,
  avatarId: AVATARS[seat % AVATARS.length] ?? 'GREEN',
  role: isHost ? 'HOST' : 'PLAYER',
  isReady: isHost,
  joinedAt: new Date().toISOString(),
});

const createRoom = async (client: EduPartyClient, nickname: string): Promise<RoomSession> => {
  const hostId = await ensureAnonymousSession(client);
  // The Host is player 1 of 6, so the board starts with seat 0 taken.
  const slots = Array.from({ length: MAX_PLAYERS }, (_, index) =>
    index === 0 ? makePlayer(hostId, nickname, 0, true) : null,
  );

  for (let attempt = 0; attempt < PIN_ATTEMPTS; attempt += 1) {
    const pin = generateRoomPin();
    const { data, error } = await client
      .from('rooms')
      .insert({
        pin,
        host_id: hostId,
        state: toJson(
          toPersistedState({
            pin,
            hostId,
            status: 'LOBBY_IDLE',
            slots,
            selectedGameId: null,
            currentRound: null,
            gameSetup: DEFAULT_STOP_GAME_SETUP,
            scores: {},
            lastRoundPoints: {},
          }),
        ),
      })
      .select()
      .single<RoomRow>();

    if (error === null) {
      // Best-effort: a failed log entry must never block the room a Host is
      // waiting on. `public.rooms` is deleted by the expiry sweep, so this
      // is the only durable record that the room ever existed. Supabase's
      // query builder is a lazy thenable — the request only fires inside
      // its own `.then()`, so this needs an explicit (no-op) `.then()` to
      // actually go out; `void` alone on the un-awaited builder would
      // silently never send it.
      void client
        .from('room_events')
        .insert({ event_type: 'ROOM_CREATED', pin, host_id: hostId })
        .then(
          () => undefined,
          () => undefined,
        );
      trackRoomCreated();

      return {
        room: rowToRoomState(data),
        playerId: hostId,
        role: 'HOST',
        nickname,
        joinedAt: new Date().toISOString(),
      };
    }
    if (error.code !== UNIQUE_VIOLATION) {
      throw new Error(`Could not create the room: ${error.message}`);
    }
  }

  throw new Error(`Could not find a free PIN after ${PIN_ATTEMPTS} attempts.`);
};

const joinRoom = async (
  client: EduPartyClient,
  pin: string,
  nickname: string,
): Promise<RoomSession> => {
  const playerId = await ensureAnonymousSession(client);

  const { data, error } = await client
    .from('rooms')
    .select()
    .eq('pin', pin)
    .eq('is_open', true)
    .maybeSingle<RoomRow>();

  if (error !== null) throw new RoomJoinError('UNKNOWN');
  if (data === null) throw new RoomJoinError('ROOM_NOT_FOUND');

  const room = rowToRoomState(data);

  // Same browser, second tab: this identity is already in the room. It is
  // coming back, not arriving, so it never competes for a seat and is never
  // turned away — a full board must not lock someone out of their own match.
  if (playerId === room.hostId) {
    // The route asked for a Player, but the room row says otherwise, and the
    // row wins: presence and RLS would both call this identity the Host anyway.
    const seat = room.slots.find((slot) => slot?.id === playerId);
    return {
      room,
      playerId,
      role: 'HOST',
      nickname: seat?.nickname ?? nickname,
      joinedAt: new Date().toISOString(),
    };
  }

  const isSeated = room.slots.some((slot) => slot?.id === playerId);
  if (!isSeated && countPlayers(room) >= MAX_PLAYERS) throw new RoomJoinError('ROOM_FULL');

  // Only a genuinely new seat counts as a join — a refresh reclaiming an
  // existing one is a reconnect, not a new arrival.
  if (!isSeated) trackRoomJoined();

  return { room, playerId, role: 'PLAYER', nickname, joinedAt: new Date().toISOString() };
};

/**
 * The room outlives the tab that created it, so a returning Host should walk
 * back in instead of minting a new room and stranding the Players.
 * Never signs in: no session means there is nothing to resume.
 */
const findResumableRoom = async (client: EduPartyClient): Promise<RoomSession | null> => {
  const { data: auth } = await client.auth.getSession();
  const hostId = auth.session?.user.id;
  if (hostId === undefined) return null;

  const freshEnough = new Date(Date.now() - ROOM_LIFETIME_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await client
    .from('rooms')
    .select()
    .eq('host_id', hostId)
    .eq('is_open', true)
    .gt('updated_at', freshEnough)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<RoomRow>();

  if (error !== null || data === null) return null;

  const room = rowToRoomState(data);
  const seat = room.slots.find((slot) => slot?.id === hostId);

  return {
    room,
    playerId: hostId,
    role: 'HOST',
    nickname: seat?.nickname ?? 'HOST',
    joinedAt: new Date().toISOString(),
  };
};

/**
 * Which of these PINs still exist. One query for the whole list, so the landing
 * never offers a door that leads nowhere.
 */
const findLiveRooms = async (
  client: EduPartyClient,
  pins: readonly string[],
): Promise<string[]> => {
  if (pins.length === 0) return [];

  const { data, error } = await client
    .from('rooms')
    .select('pin')
    .in('pin', [...pins])
    .eq('is_open', true);

  if (error !== null || data === null) throw new Error('Could not check which rooms are alive.');

  return data.map((row) => row.pin);
};

export const createSupabaseRoomService = (
  client: EduPartyClient = getSupabaseClient(),
): RoomService => ({
  createRoom: (nickname) => createRoom(client, nickname),
  joinRoom: (pin, nickname) => joinRoom(client, pin, nickname),
  findResumableRoom: () => findResumableRoom(client),
  findLiveRooms: (pins) => findLiveRooms(client, pins),
});
