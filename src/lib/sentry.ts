import * as Sentry from '@sentry/react';

import type { PlayerRole } from '@/types';

/**
 * Initializes Sentry once per page load. Safe to call with an empty DSN —
 * the SDK silently no-ops and nothing ships — matching the same
 * empty-env-var-means-off pattern GA4 already uses (see lib/analytics.ts).
 */
export const initSentry = (dsn: string) => {
  if (!dsn) return;

  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    // Low on purpose: enough to catch systematically slow Realtime
    // round-trips without burning through the free tier's event quota.
    tracesSampleRate: 0.1,
  });
};

// djb2 — not cryptographic, just enough that a raw PIN never leaves the
// browser in an event. PINs are short-lived and low-stakes, so this is
// about hygiene (never send it, even hashed-badly), not attack resistance.
const hashPin = (pin: string): string => {
  let hash = 5381;
  for (const char of pin) {
    hash = (hash * 33) ^ char.charCodeAt(0);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Tags every subsequent Sentry event with the participant's role and a
 * hashed room PIN, so an error can be filtered or correlated by room
 * without the raw PIN — or anything else about the room — ever leaving
 * the browser.
 */
export const tagRoomContext = (role: PlayerRole, pin: string) => {
  Sentry.setTag('role', role);
  Sentry.setTag('roomPin', hashPin(pin));
};
