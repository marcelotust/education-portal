import { useCallback, useMemo, useReducer, type ReactNode } from 'react';

import type { PlayerRole, RoomEvent, RoomState } from '@/types';
import { RoomContext } from './roomContext';
import { isHostOnlyEvent, roomReducer } from './roomMachine';

interface RoomProviderProps {
  initialState: RoomState;
  /** Role of the local participant. Clients are read-only listeners. */
  role: PlayerRole;
  children: ReactNode;
}

export const RoomProvider = ({ initialState, role, children }: RoomProviderProps) => {
  const [state, rawDispatch] = useReducer(roomReducer, initialState);
  const isHost = role === 'HOST';

  const dispatch = useCallback(
    (event: RoomEvent) => {
      if (isHostOnlyEvent(event) && !isHost) return;
      rawDispatch(event);
    },
    [isHost],
  );

  const value = useMemo(() => ({ state, role, isHost, dispatch }), [state, role, isHost, dispatch]);

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
