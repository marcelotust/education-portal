import { afterEach, describe, expect, it } from 'vitest';

import { loadGoogleAnalytics, trackPageView, trackRoomCreated } from './analytics';

// gtag.js's bootstrapping relies on dataLayer entries being genuine
// `arguments` objects (see analytics.ts) rather than arrays, so compare by
// value instead of relying on toContainEqual's array identity checks.
const dataLayerAsArrays = () =>
  window.dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>));

afterEach(() => {
  document.head.innerHTML = '';
  Reflect.deleteProperty(window, 'gtag');
  Reflect.deleteProperty(window, 'dataLayer');
});

describe('loadGoogleAnalytics', () => {
  it('injects the gtag.js script tag for the given measurement ID', () => {
    loadGoogleAnalytics('G-TEST123');

    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    expect(script?.getAttribute('src')).toContain('G-TEST123');
  });

  it('does not inject a second script tag on repeated calls', () => {
    loadGoogleAnalytics('G-TEST123');
    loadGoogleAnalytics('G-TEST123');

    expect(document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')).toHaveLength(
      1,
    );
  });

  it('queues the initial config call onto the dataLayer', () => {
    loadGoogleAnalytics('G-TEST123');

    expect(dataLayerAsArrays()).toContainEqual(['config', 'G-TEST123', { send_page_view: false }]);
  });
});

describe('trackPageView', () => {
  it('pushes a page_view event once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackPageView('/host');

    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'page_view',
      expect.objectContaining({ page_path: '/host' }),
    ]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackPageView('/host')).not.toThrow();
  });
});

describe('trackRoomCreated', () => {
  it('pushes a room_created event once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackRoomCreated();

    expect(dataLayerAsArrays()).toContainEqual(['event', 'room_created', {}]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackRoomCreated()).not.toThrow();
  });
});
