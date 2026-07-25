import { useMemo, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { LobbyScreen } from '@/features/lobby/LobbyScreen';
import { HostEntryScreen } from '@/features/room/HostEntryScreen';
import { JoinRoomScreen } from '@/features/room/JoinRoomScreen';
import { RoomPresenceBridge } from '@/features/room/RoomPresenceBridge';
import { RoomStateBridge } from '@/features/room/RoomStateBridge';
import { RoomProvider } from '@/hooks/RoomProvider';
import { createSupabaseRoomService } from '@/lib/room/supabaseRoomService';
import type { PlayerRole } from '@/types';
import type { RoomSession } from '@/types/roomService';

interface RoomRouteProps {
  role: PlayerRole;
}

/**
 * Entry point of a room: shows the create/join screen until there is a
 * session, then mounts the FSM for the resulting role.
 */
export const RoomRoute = ({ role }: RoomRouteProps) => {
  const service = useMemo(() => createSupabaseRoomService(), []);
  const [session, setSession] = useState<RoomSession | null>(null);

  return (
    <AppLayout>
      {session === null ? (
        role === 'HOST' ? (
          <HostEntryScreen createRoom={service.createRoom} onReady={setSession} />
        ) : (
          <JoinRoomScreen joinRoom={service.joinRoom} onReady={setSession} />
        )
      ) : (
        <RoomProvider initialState={session.room} role={session.role}>
          <RoomPresenceBridge
            me={{
              playerId: session.playerId,
              nickname: session.nickname,
              role: session.role,
              joinedAt: session.joinedAt,
            }}
          />
          <RoomStateBridge />
          <LobbyScreen />
        </RoomProvider>
      )}
    </AppLayout>
  );
};
