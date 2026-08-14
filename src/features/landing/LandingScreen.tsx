import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { listRecentRooms } from '@/lib/recentRooms';

interface LandingScreenProps {
  /** An open room this visitor still hosts, if any. */
  resumableRoom: { pin: string } | null;
  /**
   * PINs confirmed to still exist. `null` while unknown — the list is shown
   * optimistically rather than hidden behind a round trip.
   */
  livePins?: readonly string[] | null | undefined;
}

/** The front door: what this is, and the two ways in. */
export const LandingScreen = ({ resumableRoom, livePins }: LandingScreenProps) => {
  const navigate = useNavigate();
  // Read once: the list only changes by leaving this screen.
  const [remembered] = useState(listRecentRooms);
  const recentRooms =
    livePins == null ? remembered : remembered.filter((room) => livePins.includes(room.pin));

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-arcade text-lg text-rose-500">EDUPARTY</h1>
        <p className="font-terminal text-xl text-gray-700">
          Turn your class into an arcade. The Host opens a room, everyone joins with a 4-letter PIN,
          and you play together — no accounts, no downloads.
        </p>
        <p className="font-terminal text-lg text-gray-500">
          Up to 6 players per room. First cartridge: STOP.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <RetroButton tone="green" onClick={() => void navigate('/host')}>
          CREATE A ROOM
        </RetroButton>
        <RetroButton tone="cyan" onClick={() => void navigate('/play')}>
          JOIN A ROOM
        </RetroButton>
      </div>

      {recentRooms.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">
            Rooms you joined
          </p>

          {recentRooms.map((room) => (
            <button
              key={room.pin}
              type="button"
              aria-label={`Rejoin ${room.pin} as ${room.nickname}`}
              onClick={() => void navigate(`/play?pin=${room.pin}`)}
              className="flex min-h-11 items-center justify-between gap-3 border-4 border-black bg-white px-3 py-3 font-arcade text-[10px] text-black transition-colors hover:bg-gray-50"
            >
              <span className="tracking-[0.3em] text-sky-500">{room.pin}</span>
              <span className="text-gray-500">{room.nickname}</span>
            </button>
          ))}

          <p className="font-terminal text-sm text-gray-500">
            Saved on this device only — the room itself may already be over.
          </p>
        </div>
      )}

      {resumableRoom !== null && (
        <div className="flex flex-col gap-2">
          <p className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">
            Load your last room
          </p>

          <RetroButton tone="yellow" onClick={() => void navigate('/host')}>
            RESUME {resumableRoom.pin}
          </RetroButton>
        </div>
      )}
    </RetroContainer>
  );
};
