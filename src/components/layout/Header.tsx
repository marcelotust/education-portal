import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useScrolled } from '@/hooks/useScrolled';
import { cn } from '@/utils/cn';

/**
 * Persistent brand mark at the top of every screen, linking back to the
 * front door. Sticky, and compacts once the page actually scrolls — smaller
 * logo, less sky-blue margin, shifted from centered to the left edge of the
 * content column — so it stops competing with whatever's being read below
 * it. Publishes its own rendered height as `--header-height` so sticky
 * sub-headers elsewhere (round screens) can stack under it instead of
 * hardcoding a guess.
 *
 * The header itself carries no background — it sits directly on the page's
 * sky. Only once scrolled, when the logo shrinks, does it ride a small
 * cloud: at full size against the sky there was nothing to separate it
 * from, but shrunk it made scrolled content look like it was sliding in
 * behind the sky itself (#129). The cloud is a plain CSS blob for now; swap
 * the span below for a pixel-art image once that asset exists.
 */
export const Header = () => {
  const scrolled = useScrolled();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (header === null) return;
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  });

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-20 w-full px-4 pb-2 transition-[padding] duration-200',
        scrolled ? 'pt-2' : 'pt-4',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-md transition-[justify-content] duration-200',
          scrolled ? 'justify-start' : 'justify-center',
        )}
      >
        <Link to="/" className="relative inline-flex items-center px-4 py-2">
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 -z-10 border-4 border-ink bg-white transition-opacity duration-200 [border-radius:63%_37%_54%_46%/55%_48%_52%_45%]',
              scrolled ? 'opacity-100' : 'opacity-0',
            )}
          />
          <img
            src="/logo.png"
            alt="EduParty"
            width={485}
            height={95}
            className={cn(
              'w-auto transition-[height] duration-200',
              scrolled ? 'h-6' : 'h-11 sm:h-14',
            )}
          />
        </Link>
      </div>
    </header>
  );
};
