import { useEffect, useState } from 'react';

// Two thresholds, not one: compacting the header (e.g. Header.tsx) shrinks page
// height, which can pull the scroll position back under a single threshold and
// flip this straight back — an infinite jitter on short pages where the
// scrollable range is barely bigger than the collapse itself. The gap between
// enter and exit must clear that collapse so crossing it can't retrigger a flip.
const ENTER_THRESHOLD_PX = 56;
const EXIT_THRESHOLD_PX = 8;

// No hysteresis here, unlike the scroll thresholds above: this only
// recomputes from a real 'resize' or a childList/subtree DOM mutation (a
// route or screen swap), never from the header's own collapse — that's a
// className change with no node added or removed, so it doesn't trigger
// either observer and can't feed back into this check. A plain comparison
// is enough, and it's what lets navigating from a tall page to a short one
// clear the compact state immediately instead of getting stuck by a stale
// margin sized for a different page's content.
const isPageOverflowing = (): boolean => document.documentElement.scrollHeight > window.innerHeight;

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
    const checkOverflow = () => setOverflowing(isPageOverflowing());
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
