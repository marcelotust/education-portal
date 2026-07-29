import { ArcadeButton } from '@/components/ui/ArcadeButton';
import type { RoomSession } from '@/types/roomService';
import { countPlayers } from '@/utils/room';

interface ResumeRoomBannerProps {
  session: RoomSession;
  onResume: (session: RoomSession) => void;
}

/**
 * A refresh used to abandon the room and strand the Players in it. The room
 * lives in the database, so the Host can simply walk back in.
 */
export const ResumeRoomBanner = ({ session, onResume }: ResumeRoomBannerProps) => (
  <div className="flex flex-col gap-3 rounded-lg border-2 border-arcade-yellow/60 bg-slate-900/60 p-4 text-center">
    <p className="font-terminal text-lg text-slate-300">You still have a room open</p>

    <p className="text-neon font-arcade text-2xl tracking-[0.4em] text-arcade-yellow">
      {session.room.pin}
    </p>

    <p className="font-terminal text-sm text-slate-500">
      {countPlayers(session.room)} player(s) were seated
    </p>

    <ArcadeButton tone="yellow" onClick={() => onResume(session)}>
      RESUME ROOM
    </ArcadeButton>
  </div>
);
