import type { RoomState } from './room';

/** The JSONB payload stored in `rooms.state`; PIN and host live in columns. */
export type PersistedRoomState = Omit<RoomState, 'pin' | 'hostId'>;

export interface RoomRow {
  id: string;
  pin: string;
  host_id: string;
  state: PersistedRoomState;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export type RoomInsert = Pick<RoomRow, 'pin' | 'host_id'> & Partial<Pick<RoomRow, 'state'>>;

export type RoomUpdate = Partial<Pick<RoomRow, 'state' | 'is_open'>>;

/**
 * Minimal hand-written schema for `supabase-js` generics.
 * Regenerate with `npx supabase gen types typescript --linked` once the
 * project is linked, and keep `RoomRow['state']` narrowed to the FSM type.
 */
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: RoomRow;
        Insert: RoomInsert;
        Update: RoomUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
