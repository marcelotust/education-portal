import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
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
  <RetroContainer className="flex flex-col gap-3 bg-orange-50 p-4 text-center">
    <p className="font-terminal text-lg text-gray-700">You still have a room open</p>

    <p className="text-solid-shadow mx-auto border-4 border-dashed border-rose-500 bg-white/60 px-4 py-2 font-arcade text-4xl tracking-[0.3em] text-orange-500">
      {session.room.pin}
    </p>

    <p className="font-terminal text-sm text-gray-500">
      {countPlayers(session.room)} player(s) were seated
    </p>

    <RetroButton tone="yellow" onClick={() => onResume(session)}>
      RESUME ROOM
    </RetroButton>
  </RetroContainer>
);
