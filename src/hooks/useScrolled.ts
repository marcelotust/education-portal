import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD_PX = 8;

/** Whether the page has scrolled past a small threshold, for chrome that compacts once it does. */
export const useScrolled = (): boolean => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
};
