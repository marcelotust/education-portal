import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { tagRoomContext } from '@/lib/sentry';
import type { PlayerRole, RoomEvent, RoomState } from '@/types';
import { RoomContext } from './roomContext';
import { isHostOnlyEvent, roomReducer } from './roomMachine';

interface RoomProviderProps {
  initialState: RoomState;
  /** Role of the local participant. Players are read-only listeners. */
  role: PlayerRole;
  children: ReactNode;
}

export const RoomProvider = ({ initialState, role, children }: RoomProviderProps) => {
  const [state, rawDispatch] = useReducer(roomReducer, initialState);
  const isHost = role === 'HOST';

  // So an unhandled error can be filtered/correlated by room in Sentry
  // without the raw PIN, or anything else about the room, ever leaving
  // the browser (see lib/sentry.ts).
  useEffect(() => {
    tagRoomContext(role, state.pin);
  }, [role, state.pin]);

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
