import { useEffect, useMemo, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { LandingScreen } from '@/features/landing/LandingScreen';
import { createSupabaseRoomService } from '@/lib/room/supabaseRoomService';

/** Front door of the app: presentation plus the ways back into a room. */
export const LandingRoute = () => {
  const service = useMemo(() => createSupabaseRoomService(), []);
  const [resumableRoom, setResumableRoom] = useState<{ pin: string } | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void service
      .findResumableRoom()
      .then((found) => {
        if (isCurrent && found !== null) setResumableRoom({ pin: found.room.pin });
      })
      .catch(() => {
        // Nothing to resume is the normal case for a first-time visitor.
      });

    return () => {
      isCurrent = false;
    };
  }, [service]);

  return (
    <AppLayout>
      <LandingScreen resumableRoom={resumableRoom} />
    </AppLayout>
  );
};
