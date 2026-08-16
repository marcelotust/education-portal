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
        'sticky top-0 z-20 w-full bg-sky-400 px-4 transition-[padding] duration-200',
        scrolled ? 'py-2' : 'py-4',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-md transition-[justify-content] duration-200',
          scrolled ? 'justify-start' : 'justify-center',
        )}
      >
        <Link to="/">
          <img
            src="/logo.png"
            alt="EduParty"
            width={485}
            height={95}
            className={cn(
              'w-auto transition-[height] duration-200',
              scrolled ? 'h-6' : 'h-8 sm:h-10',
            )}
          />
        </Link>
      </div>
    </header>
  );
};
