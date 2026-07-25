import { useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import { toJson, type RoomRow } from '@/types/database';
import type { PersistedRoomState, RoomState } from '@/types';

const toPayload = (state: RoomState): PersistedRoomState => ({
  status: state.status,
  slots: state.slots,
  selectedGameId: state.selectedGameId,
  currentRound: state.currentRound,
});

interface UseRoomStateSyncOptions {
  state: RoomState;
  isHost: boolean;
  onRemoteState: (state: PersistedRoomState) => void;
}

/**
 * Two halves of one loop: the Host writes every FSM change to the room row,
 * and everyone (Host included) applies the row updates Realtime pushes back.
 * The reducer bails out on an unchanged state, so the echo cannot loop.
 */
export const useRoomStateSync = ({ state, isHost, onRemoteState }: UseRoomStateSyncOptions) => {
  const { pin } = state;
  const lastPersisted = useRef<string | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client
      .channel(`room-row:${pin}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `pin=eq.${pin}` },
        (message) => {
          const row = message.new as RoomRow;
          onRemoteState(row.state);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
    // onRemoteState is a stable dispatch wrapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    if (!isHost) return;

    const payload = toPayload(state);
    const serialised = JSON.stringify(payload);
    if (serialised === lastPersisted.current) return;
    lastPersisted.current = serialised;

    void getSupabaseClient()
      .from('rooms')
      .update({ state: toJson(payload) })
      .eq('pin', pin)
      .then(({ error }) => {
        if (error !== null) {
          // Let the next change retry instead of silently drifting.
          lastPersisted.current = null;
          console.error('Failed to persist room state:', error.message);
        }
      });
  }, [state, isHost, pin]);
};
