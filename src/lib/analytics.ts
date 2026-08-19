import type { GameId } from '@/types/game';
import type { FeedbackCategory } from '@/types/feedbackService';

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

/** Fired once a Host's room is persisted (#125). No-op before gtag loads. */
export const trackRoomCreated = () => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'room_created', {});
};

/** Fired once a Player is seated in a room (#126). No-op before gtag loads. */
export const trackRoomJoined = () => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'room_joined', {});
};

/** Fired when the Host starts a match (#126). No-op before gtag loads. */
export const trackGameStarted = (gameId: GameId) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'game_started', { game_id: gameId });
};

/** Fired once the scoreboard is reached (#126). No-op before gtag loads. */
export const trackGameCompleted = () => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'game_completed', {});
};

/** Fired once a contact-form submission is persisted (#126). No-op before gtag loads. */
export const trackContactSubmitted = (category: FeedbackCategory) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'contact_submitted', { category });
};
