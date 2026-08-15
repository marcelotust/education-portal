import { useEffect, useMemo, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { LandingScreen } from '@/features/landing/LandingScreen';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { listRecentRooms } from '@/lib/recentRooms';
import { createSupabaseRoomService } from '@/lib/room/supabaseRoomService';

/** Front door of the app: presentation plus the ways back into a room. */
export const LandingRoute = () => {
  useDocumentMeta({
    title: 'EduParty — Free Party Games for Online English Classes',
    description:
      'EduParty is a free, no-signup game portal for online English classes. Host a room, share a 4-letter PIN, and play STOP, QUIZ, or TABOO together.',
  });
  const service = useMemo(() => createSupabaseRoomService(), []);
  const [resumableRoom, setResumableRoom] = useState<{ pin: string } | null>(null);
  const [livePins, setLivePins] = useState<readonly string[] | null>(null);

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

  useEffect(() => {
    let isCurrent = true;
    const pins = listRecentRooms().map((room) => room.pin);
    if (pins.length === 0) return;

    void service
      .findLiveRooms(pins)
      .then((alive) => {
        if (isCurrent) setLivePins(alive);
      })
      .catch(() => {
        // Offline or refused: keep showing the list rather than an empty page.
      });

    return () => {
      isCurrent = false;
    };
  }, [service]);

  return (
    <AppLayout>
      <LandingScreen resumableRoom={resumableRoom} livePins={livePins} />
    </AppLayout>
  );
};
