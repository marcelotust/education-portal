import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { loadGoogleAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Side-effect-only bridge (renders nothing, like RoomPresenceBridge):
 * loads gtag.js once a measurement ID is configured (#91) and fires a
 * page_view on every SPA route change, since gtag's own automatic pageview
 * only fires once, on the initial document load.
 */
export const GoogleAnalytics = () => {
  const location = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!measurementId) return;
    loadGoogleAnalytics(measurementId);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId) return;
    trackPageView(location.pathname + location.search);
  }, [measurementId, location.pathname, location.search]);

  return null;
};
