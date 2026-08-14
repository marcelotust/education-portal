import { useHostAway } from '@/hooks/useHostAway';
import { useRoom } from '@/hooks/useRoom';
import type { RoomStatus } from '@/types';

/** Phases that only the Host can move on: without it, they never end. */
const HOST_DRIVEN: readonly RoomStatus[] = [
  'PLAYING_AD',
  'PLAYING',
  // The reveal waits on the Host by design, so its absence strands it.
  'SHOWING_ANSWER',
  'CALCULATING_SCORES',
];

/**
 * Covers the screen while the Host is disconnected mid-round. The round cannot
 * end without it, so a silent dead timer is the worst possible answer: say so
 * instead, and stop the Players typing into a round nobody will close.
 */
export const HostAwayOverlay = () => {
  const { state } = useRoom();
  const isHostAway = useHostAway();

  if (!isHostAway || !HOST_DRIVEN.includes(state.status)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div
        role="alert"
        className="flex max-w-sm flex-col items-center gap-4 border-4 border-black bg-white px-6 py-8 text-center shadow-retro"
      >
        <p className="animate-blink font-arcade text-sm text-rose-500">PAUSED</p>
        <p className="font-arcade text-[10px] leading-relaxed text-yellow-500">
          Waiting for the Host to come back
        </p>
        <p className="font-terminal text-lg leading-tight text-gray-700">
          They dropped out of the room, so the round cannot end. Keep this screen open — nothing you
          typed is lost.
        </p>
      </div>
    </div>
  );
};
