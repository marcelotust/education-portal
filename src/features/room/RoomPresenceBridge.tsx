import { useCallback } from 'react';

import { useRoom } from '@/hooks/useRoom';
import { useRoomPresence } from '@/hooks/useRoomPresence';
import type { PresencePayload } from '@/lib/room/presence';
import type { PlayerSlot } from '@/types';

interface RoomPresenceBridgeProps {
  me: PresencePayload;
}

/** Wires Realtime Presence into the room FSM. Renders nothing. */
export const RoomPresenceBridge = ({ me }: RoomPresenceBridgeProps) => {
  const { state, dispatch } = useRoom();

  const onSlotsChanged = useCallback(
    (slots: readonly PlayerSlot[]) => dispatch({ type: 'PLAYERS_SYNCED', slots }),
    [dispatch],
  );

  useRoomPresence({ pin: state.pin, hostId: state.hostId, me, onSlotsChanged });

  return null;
};
