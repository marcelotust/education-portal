import { useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { LobbyScreen } from '@/features/lobby/LobbyScreen';
import { createMockRoom } from '@/features/lobby/mockRoom';
import { RoomProvider } from '@/hooks/RoomProvider';
import type { PlayerRole } from '@/types';

interface RoomRouteProps {
  role: PlayerRole;
}

/** Mounts the room FSM for a given role. Backed by mock data for now. */
export const RoomRoute = ({ role }: RoomRouteProps) => {
  const [initialState] = useState(createMockRoom);

  return (
    <RoomProvider initialState={initialState} role={role}>
      <AppLayout>
        <LobbyScreen />
      </AppLayout>
    </RoomProvider>
  );
};
