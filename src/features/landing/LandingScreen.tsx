import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { GAME_CARTRIDGES } from '@/features/lobby/cartridges';
import { ComingSoonCartridge } from '@/features/lobby/components/ComingSoonCartridge';
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
    <div className="flex flex-col gap-6">
      {/* Direct on the page's sky-blue, matching the logo above it instead of
          jumping straight into a boxed white card. */}
      <header className="flex flex-col items-center gap-3 px-2 text-center">
        <h1 className="text-solid-shadow font-arcade text-lg text-yellow-400">
          A live game portal for video classes.
        </h1>
        <p className="font-terminal text-xl text-ink">
          EduParty turns any video call into a shared arcade — one Host opens a room, everyone else
          joins by typing a 4-letter PIN into their own browser, and you&apos;re playing together
          inside the same call.
        </p>
        <p className="font-terminal text-lg text-ink/80">
          Built for language teachers who need a two-minute warm-up or wrap-up between drills, and
          open to any host who wants a free, no-download way to make a call feel like a room full of
          people instead of a grid of faces.
        </p>
        <p className="font-arcade text-[9px] uppercase tracking-widest text-ink">
          Free · No accounts · Up to 6 players · Live in under a minute
        </p>
      </header>

      <RetroContainer className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3">
          <RetroButton tone="green" onClick={() => void navigate('/host')}>
            CREATE A ROOM
          </RetroButton>
          <RetroButton tone="cyan" onClick={() => void navigate('/play')}>
            JOIN A ROOM
          </RetroButton>
        </div>

        <div className="flex flex-col gap-3 text-center">
          <SectionLabel>Play these today</SectionLabel>
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {GAME_CARTRIDGES.map((cartridge) => (
              <li
                key={cartridge.id}
                data-testid={`game-cartridge-${cartridge.id}`}
                className="flex items-center gap-2"
              >
                <div className="w-10 shrink-0">
                  <GameSpriteThumb spritePosition={cartridge.spritePosition} />
                </div>
                <span className="font-terminal text-xl text-gray-700">{cartridge.title}</span>
              </li>
            ))}
          </ul>
          <ComingSoonCartridge />
        </div>
      </RetroContainer>

      {(recentRooms.length > 0 || resumableRoom !== null) && (
        <RetroContainer data-testid="recent-rooms-panel" className="flex flex-col gap-6 p-6">
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
      )}
    </div>
  );
};
