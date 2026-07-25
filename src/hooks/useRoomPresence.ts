import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { useEffect } from 'react';

import { buildSlotsFromPresence, type PresencePayload } from '@/lib/room/presence';
import { getSupabaseClient } from '@/lib/supabase';
import type { PlayerSlot } from '@/types';

interface UseRoomPresenceOptions {
  pin: string;
  hostId: string;
  me: PresencePayload;
  onSlotsChanged: (slots: readonly PlayerSlot[]) => void;
}

/**
 * Joins the room channel and keeps the board in sync with who is actually
 * connected. Presence is the live source of truth for seats; the room row
 * stays the source of truth for the FSM.
 */
export const useRoomPresence = ({ pin, hostId, me, onSlotsChanged }: UseRoomPresenceOptions) => {
  const { playerId, nickname, role, joinedAt } = me;

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client.channel(`room:${pin}`, {
      config: { presence: { key: playerId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const payloads = Object.values(channel.presenceState<PresencePayload>()).flat();
        onSlotsChanged(buildSlotsFromPresence(payloads, hostId));
      })
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          void channel.track({ playerId, nickname, role, joinedAt } satisfies PresencePayload);
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
    // onSlotsChanged is a stable dispatch wrapper; re-subscribing on every
    // render would drop and recreate the channel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, hostId, playerId, nickname, role, joinedAt]);
};
