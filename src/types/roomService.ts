import type { PlayerRole } from './player';
import type { RoomState } from './room';

/** What a participant gets after creating or joining a room. */
export interface RoomSession {
  room: RoomState;
  /** Supabase anonymous user id of the local participant. */
  playerId: string;
  role: PlayerRole;
  /** Broadcast over Presence so the others can render this seat. */
  nickname: string;
  joinedAt: string;
}

export type RoomJoinFailure = 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'UNKNOWN';

/** Typed failure so screens can show the right message instead of parsing strings. */
export class RoomJoinError extends Error {
  readonly reason: RoomJoinFailure;

  constructor(reason: RoomJoinFailure) {
    super(`Failed to join room: ${reason}`);
    this.name = 'RoomJoinError';
    this.reason = reason;
  }
}

export type CreateRoom = (nickname: string) => Promise<RoomSession>;
/** An open room this user still hosts, so a refresh does not abandon a class. */
export type FindResumableRoom = () => Promise<RoomSession | null>;
/** Which of these PINs still exist, so no dead door is offered. */
export type FindLiveRooms = (pins: readonly string[]) => Promise<string[]>;
export type JoinRoom = (pin: string, nickname: string) => Promise<RoomSession>;

/** Injected into the entry screens so specs never touch the network. */
export interface RoomService {
  createRoom: CreateRoom;
  joinRoom: JoinRoom;
  findResumableRoom: FindResumableRoom;
  findLiveRooms: FindLiveRooms;
}
