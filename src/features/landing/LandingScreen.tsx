import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
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
        <p className="font-arcade text-[10px] uppercase tracking-widest text-green-600">
          100% Free
        </p>
        <p className="font-terminal text-xl text-gray-700">
          Built to support online English classes — the Host opens a room, everyone joins with a
          4-letter PIN, and you play together as a warm-up, wrap-up, or reward. No accounts, no
          downloads.
        </p>
        <p className="font-terminal text-lg text-gray-500">
          Not in an English class? Everyone&apos;s invited — grab a PIN and play. Up to 6 players
          per room.
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
          <SectionLabel>Rooms you joined</SectionLabel>

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
          <SectionLabel>Load your last room</SectionLabel>

          <RetroButton tone="yellow" onClick={() => void navigate('/host')}>
            RESUME {resumableRoom.pin}
          </RetroButton>
        </div>
      )}

      <footer className="flex flex-col items-center gap-2 border-t-4 border-black pt-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link
            to="/legal#privacy"
            className="font-terminal text-sm text-gray-500 underline hover:text-gray-700"
          >
            Privacy Policy
          </Link>
          <Link
            to="/legal#terms"
            className="font-terminal text-sm text-gray-500 underline hover:text-gray-700"
          >
            Terms of Service
          </Link>
          <Link
            to="/legal#children"
            className="font-terminal text-sm text-gray-500 underline hover:text-gray-700"
          >
            Children&apos;s Privacy
          </Link>
          <Link
            to="/contact"
            className="font-terminal text-sm text-gray-500 underline hover:text-gray-700"
          >
            Suggestions &amp; Bug Reports
          </Link>
        </div>
        <p className="font-terminal text-xs text-gray-400">© 2026 EduParty</p>
      </footer>
    </RetroContainer>
  );
};
