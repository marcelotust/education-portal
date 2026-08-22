import { Link } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { cartridgeFor } from '@/features/lobby/cartridges';
import { GUIDES } from '../guideMeta';

interface GuideCrossLinksProps {
  /** Left out of its own list. */
  currentSlug: string;
}

/** The internal-linking footer every guide ends on, so a visitor who landed on one from search has a path to the rest — and so does a crawler. */
export const GuideCrossLinks = ({ currentSlug }: GuideCrossLinksProps) => {
  const others = GUIDES.filter((guide) => guide.slug !== currentSlug);

  return (
    <nav aria-label="More guides" className="flex flex-col gap-2">
      <SectionLabel>More guides</SectionLabel>
      <ul className="flex flex-col gap-2">
        {others.map((guide) => (
          <li key={guide.slug}>
            <Link
              to={`/guides/${guide.slug}`}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700"
            >
              {guide.gameId !== undefined && (
                <span className="w-8 shrink-0">
                  <GameSpriteThumb spritePosition={cartridgeFor(guide.gameId).spritePosition} />
                </span>
              )}
              <span className="font-terminal text-lg underline">{guide.navLabel}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
