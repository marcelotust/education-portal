import { PageTitle } from '@/components/ui/PageTitle';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { InviteLinkButton } from './InviteLinkButton';

interface RoomPinBannerProps {
  pin: string;
  playerCount: number;
  maxPlayers: number;
}

/** Header of the lobby: the PIN Players type plus the seat counter. */
export const RoomPinBanner = ({ pin, playerCount, maxPlayers }: RoomPinBannerProps) => (
  <header className="mb-5 flex flex-col items-center gap-2">
    <PageTitle>LOBBY</PageTitle>

    <p className="border-4 border-ink bg-sky-500 px-3 py-2 font-arcade text-[8px] text-white">
      {playerCount}/{maxPlayers} PLAYERS
    </p>

    <SectionLabel>Room PIN</SectionLabel>

    <div className="flex justify-center">
      {/* Relative to just the PIN's own width, not the full-width row, so
          the PIN stays visually centered and the share button floats beside
          it instead of the pair being centered as one wider unit. */}
      <div className="relative inline-flex">
        <p className="text-solid-shadow border-4 border-dashed border-rose-500 bg-white/60 px-4 py-2 font-arcade text-4xl tracking-[0.3em] text-orange-500">
          {pin}
        </p>
        <span className="absolute left-full top-1/2 ml-2 -translate-y-1/2">
          <InviteLinkButton pin={pin} />
        </span>
      </div>
    </div>
  </header>
);
