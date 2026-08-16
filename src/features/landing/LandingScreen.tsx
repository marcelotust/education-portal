import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { GAME_CARTRIDGES, LOADING_CARD } from '@/features/lobby/cartridges';
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
        <h1 className="font-terminal text-2xl text-rose-500">
          A retro arcade built to make online classes feel like game night.
        </h1>
        <p className="font-arcade text-[10px] uppercase tracking-widest text-green-600">
          100% Free
        </p>
        <p className="font-terminal text-xl text-gray-700">
          The Host opens a room, everyone joins with a 4-letter PIN, and you play together as a
          warm-up, wrap-up, or reward for online English classes. No accounts, no downloads.
        </p>
        <p className="font-terminal text-lg text-gray-500">
          Not in an English class? Everyone&apos;s invited. Grab a PIN and play. Up to 6 players per
          room.
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

      <div className="flex flex-col gap-3">
        <SectionLabel>Play these today</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          {GAME_CARTRIDGES.map((cartridge) => (
            <div
              key={cartridge.id}
              className="flex flex-col items-center gap-2 border-4 border-ink bg-white p-3 text-center"
            >
              <GameSpriteThumb spritePosition={cartridge.spritePosition} />
              <span className="font-arcade text-xs text-rose-500">{cartridge.title}</span>
              <span className="font-terminal text-base text-gray-600">{cartridge.tagline}</span>
            </div>
          ))}

          <div className="flex flex-col items-center gap-2 border-4 border-ink bg-gray-100 p-3 text-center text-gray-500">
            <GameSpriteThumb spritePosition={LOADING_CARD.spritePosition} />
            <span className="font-arcade text-xs">{LOADING_CARD.title}</span>
            <span className="font-terminal text-base">{LOADING_CARD.tagline}</span>
          </div>
        </div>
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
              className="flex min-h-11 items-center justify-between gap-3 border-4 border-ink bg-white px-3 py-3 font-arcade text-[10px] text-black transition-colors hover:bg-gray-50"
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
    </RetroContainer>
  );
};
