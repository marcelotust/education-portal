declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GTAG_SCRIPT_ID = 'ga4-gtag-script';

/**
 * Injects the gtag.js snippet once per document. Safe to call on every
 * mount — subsequent calls are no-ops because the script tag persists.
 */
export const loadGoogleAnalytics = (measurementId: string) => {
  if (document.getElementById(GTAG_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = GTAG_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  // gtag.js's own bootstrapping code expects the raw `arguments` object it
  // queues and replays once loaded — pushing a rest-params array instead
  // looks equivalent but gtag.js silently never drains it (no cookie ever
  // gets set, no hit ever sent). Match the official snippet exactly.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- must be the real `arguments` object, see above.
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // send_page_view is off here because the SPA fires its own page_view per
  // route change (see GoogleAnalytics) — the automatic one would only ever
  // cover the very first load.
  window.gtag('config', measurementId, { send_page_view: false });
};

/** No-op until loadGoogleAnalytics has run, e.g. in tests or before config. */
export const trackPageView = (path: string) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};
