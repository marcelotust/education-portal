import { useEffect, useState } from 'react';

// Two thresholds, not one: compacting the header (e.g. Header.tsx) shrinks page
// height, which can pull the scroll position back under a single threshold and
// flip this straight back — an infinite jitter on short pages where the
// scrollable range is barely bigger than the collapse itself. The gap between
// enter and exit must clear that collapse so crossing it can't retrigger a flip.
const ENTER_THRESHOLD_PX = 56;
const EXIT_THRESHOLD_PX = 8;

/** Whether the page has scrolled past a small threshold, for chrome that compacts once it does. */
export const useScrolled = (): boolean => {
  const [scrolled, setScrolled] = useState(false);

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

  return scrolled;
};
