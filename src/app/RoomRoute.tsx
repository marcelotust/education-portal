import { useEffect, useMemo, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { HostEntryScreen } from '@/features/room/HostEntryScreen';
import { JoinRoomScreen } from '@/features/room/JoinRoomScreen';
import { RoomPresenceBridge } from '@/features/room/RoomPresenceBridge';
import { RoomStateBridge } from '@/features/room/RoomStateBridge';
import { RoomStage } from '@/features/room/RoomStage';
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
  const [resumableRoom, setResumableRoom] = useState<RoomSession | null>(null);

  useEffect(() => {
    if (role !== 'HOST') return;

    let isCurrent = true;
    // A Host coming back must not mint a new room over the one still running.
    void service
      .findResumableRoom()
      .then((found) => {
        if (isCurrent) setResumableRoom(found);
      })
      .catch(() => {
        // Nothing to resume is a perfectly normal outcome.
      });

    return () => {
      isCurrent = false;
    };
  }, [role, service]);

  if (session !== null) {
    return (
      <AppLayout>
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
          <RoomStage playerId={session.playerId} />
        </RoomProvider>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {role === 'HOST' ? (
        <HostEntryScreen
          createRoom={service.createRoom}
          onReady={setSession}
          resumableRoom={resumableRoom}
          onResume={setSession}
        />
      ) : (
        <JoinRoomScreen joinRoom={service.joinRoom} onReady={setSession} />
      )}
    </AppLayout>
  );
};
