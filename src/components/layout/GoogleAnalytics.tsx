import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { loadGoogleAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Side-effect-only bridge (renders nothing, like RoomPresenceBridge):
 * loads gtag.js once a measurement ID is configured (#91) and fires a
 * page_view on every SPA route change, since gtag's own automatic pageview
 * only fires once, on the initial document load.
 *
 * Gated to production builds even when a measurement ID is configured
 * locally (e.g. in .env.local): every `npm run dev` session used to send
 * real events into the same GA4 property as production, drowning out real
 * visitors in dev/test noise.
 */
export const GoogleAnalytics = () => {
  const location = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const isEnabled = import.meta.env.PROD && Boolean(measurementId);

  useEffect(() => {
    if (!isEnabled) return;
    loadGoogleAnalytics(measurementId);
  }, [isEnabled, measurementId]);

  useEffect(() => {
    if (!isEnabled) return;
    trackPageView(location.pathname + location.search);
  }, [isEnabled, location.pathname, location.search]);

  return null;
};
