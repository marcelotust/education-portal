import { useEffect, useState } from 'react';

// Two thresholds, not one: compacting the header (e.g. Header.tsx) shrinks page
// height, which can pull the scroll position back under a single threshold and
// flip this straight back — an infinite jitter on short pages where the
// scrollable range is barely bigger than the collapse itself. The gap between
// enter and exit must clear that collapse so crossing it can't retrigger a flip.
const ENTER_THRESHOLD_PX = 56;
const EXIT_THRESHOLD_PX = 8;

// Same hysteresis shape as the scroll thresholds above, but on document
// height instead of scroll position: once overflow is on, collapsing the
// header shrinks scrollHeight, which could pull the excess back under the
// viewport and flip overflow off right after it flipped on. The exit margin
// has to clear that collapse so the shrink itself can't retrigger the flip.
const OVERFLOW_ENTER_MARGIN_PX = 0;
const OVERFLOW_EXIT_MARGIN_PX = -64;

const isOverflowing = (wasOverflowing: boolean): boolean => {
  const excess = document.documentElement.scrollHeight - window.innerHeight;
  return wasOverflowing ? excess > OVERFLOW_EXIT_MARGIN_PX : excess > OVERFLOW_ENTER_MARGIN_PX;
};

/**
 * Whether the page has scrolled past a small threshold, or is already tall
 * enough to need scrolling at all — for chrome that compacts once either is
 * true, without waiting for a scroll gesture on long pages.
 */
export const useScrolled = (): boolean => {
  const [scrolled, setScrolled] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled((prev) =>
        prev ? window.scrollY > EXIT_THRESHOLD_PX : window.scrollY > ENTER_THRESHOLD_PX,
      );
    };
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const checkOverflow = () => setOverflowing(isOverflowing);
    checkOverflow();

    window.addEventListener('resize', checkOverflow);

    // Content height can change without a resize or route change (data
    // loading in, a panel expanding) — watch the DOM itself, not just the
    // viewport.
    const observer = new MutationObserver(checkOverflow);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', checkOverflow);
      observer.disconnect();
    };
  }, []);

  return scrolled || overflowing;
};
