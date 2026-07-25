import { MAX_PLAYERS, type AvatarId, type Player } from '@/types';
import { toJson, type RoomRow } from '@/types/database';
import { RoomJoinError, type RoomService, type RoomSession } from '@/types/roomService';
import { countPlayers, generateRoomPin } from '@/utils/room';
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
  role: isHost ? 'HOST' : 'CLIENT',
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
            scores: {},
          }),
        ),
      })
      .select()
      .single<RoomRow>();

    if (error === null) {
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
  if (countPlayers(room) >= MAX_PLAYERS) throw new RoomJoinError('ROOM_FULL');

  return { room, playerId, role: 'CLIENT', nickname, joinedAt: new Date().toISOString() };
};

/**
 * The room outlives the tab that created it, so a returning Host should walk
 * back in instead of minting a new room and stranding the students.
 * Never signs in: no session means there is nothing to resume.
 */
const findResumableRoom = async (client: EduPartyClient): Promise<RoomSession | null> => {
  const { data: auth } = await client.auth.getSession();
  const hostId = auth.session?.user.id;
  if (hostId === undefined) return null;

  const { data, error } = await client
    .from('rooms')
    .select()
    .eq('host_id', hostId)
    .eq('is_open', true)
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

export const createSupabaseRoomService = (
  client: EduPartyClient = getSupabaseClient(),
): RoomService => ({
  createRoom: (nickname) => createRoom(client, nickname),
  joinRoom: (pin, nickname) => joinRoom(client, pin, nickname),
  findResumableRoom: () => findResumableRoom(client),
});
