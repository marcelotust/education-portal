import { Link } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { LOADING_CARD } from '../cartridges';

/**
 * The "more games are coming" card: the LOADING cartridge's art on the left,
 * its tagline and a link to request a game stacked on the right — shared
 * between the Lobby's shelf and the landing page's game list so the
 * invitation reads identically wherever it appears.
 */
export const ComingSoonCartridge = () => (
  <div className="flex w-full items-center justify-center gap-3 border-[3px] border-ink bg-gray-300 px-4 py-3 text-gray-500">
    <div className="w-10 shrink-0">
      <GameSpriteThumb
        spritePosition={LOADING_CARD.spritePosition}
        className="opacity-80 drop-shadow-[3px_5px_4px_rgba(56,26,65,0.55)]"
      />
    </div>

    <div className="flex flex-col gap-1 text-left">
      <span className="font-arcade text-[10px] tracking-wider">{LOADING_CARD.tagline}</span>
      <Link
        to="/contact?category=GAME_REQUEST"
        className="font-terminal text-sm text-sky-600 underline hover:text-sky-700"
      >
        Tell us what game you want to play
      </Link>
    </div>
  </div>
);
