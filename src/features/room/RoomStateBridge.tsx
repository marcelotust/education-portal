import { useCallback } from 'react';

import { useRoom } from '@/hooks/useRoom';
import { useRoomStateSync } from '@/hooks/useRoomStateSync';
import type { PersistedRoomState } from '@/types';

/** Keeps the room row and the local FSM in step. Renders nothing. */
export const RoomStateBridge = () => {
  const { state, isHost, dispatch } = useRoom();

  const onRemoteState = useCallback(
    (remote: PersistedRoomState) => dispatch({ type: 'ROOM_STATE_RECEIVED', state: remote }),
    [dispatch],
  );

  useRoomStateSync({ state, isHost, onRemoteState });

  return null;
};
