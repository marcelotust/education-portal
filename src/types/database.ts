import type { PersistedRoomState } from './room';
import type { Database, Json } from './supabase.generated';

export type { Database, Json, PersistedRoomState };

type RoomTable = Database['public']['Tables']['rooms'];

/** The generated Row types `state` as `Json`; the app knows what it really is. */
export type RoomRow = Omit<RoomTable['Row'], 'state'> & { state: PersistedRoomState };

/**
 * JSONB is structurally `Json`, but `PersistedRoomState` uses readonly arrays,
 * which `Json` does not model. The cast is confined to this one boundary.
 */
export const toJson = (state: PersistedRoomState): Json => state as unknown as Json;
