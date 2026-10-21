import { afterEach, describe, expect, it } from 'vitest';

import {
  loadGoogleAnalytics,
  trackBotAdded,
  trackContactSubmitted,
  trackGameCompleted,
  trackGameStarted,
  trackPageView,
  trackRoomCreated,
  trackRoomJoined,
} from './analytics';

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

describe('trackRoomJoined', () => {
  it('pushes a room_joined event once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackRoomJoined();

    expect(dataLayerAsArrays()).toContainEqual(['event', 'room_joined', {}]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackRoomJoined()).not.toThrow();
  });
});

describe('trackGameStarted', () => {
  it('pushes a game_started event with the game ID once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackGameStarted('STOP', false, false);

    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'game_started',
      { game_id: 'STOP', solo: false, has_bot: false },
    ]);
  });

  it('flags a match started with nobody else in the room as solo (#156)', () => {
    loadGoogleAnalytics('G-TEST123');

    trackGameStarted('STOP', true, false);

    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'game_started',
      { game_id: 'STOP', solo: true, has_bot: false },
    ]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackGameStarted('STOP', false, false)).not.toThrow();
  });
});

describe('trackGameCompleted', () => {
  it('pushes a game_completed event once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackGameCompleted(false, false);

    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'game_completed',
      { solo: false, has_bot: false },
    ]);
  });

  it('flags a match finished with nobody else in the room as solo (#156)', () => {
    loadGoogleAnalytics('G-TEST123');

    trackGameCompleted(true, false);

    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'game_completed',
      { solo: true, has_bot: false },
    ]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackGameCompleted(false, false)).not.toThrow();
  });
});

describe('bot tracking (#155)', () => {
  it('pushes a bot_added event once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackBotAdded();

    expect(dataLayerAsArrays()).toContainEqual(['event', 'bot_added', {}]);
  });

  it('flags a match that had the bot seated, so bot rounds do not read as real adoption', () => {
    loadGoogleAnalytics('G-TEST123');

    trackGameStarted('QUIZ', true, true);
    trackGameCompleted(true, true);

    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'game_started',
      { game_id: 'QUIZ', solo: true, has_bot: true },
    ]);
    expect(dataLayerAsArrays()).toContainEqual([
      'event',
      'game_completed',
      { solo: true, has_bot: true },
    ]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackBotAdded()).not.toThrow();
  });
});

describe('trackContactSubmitted', () => {
  it('pushes a contact_submitted event with the category once gtag is initialized', () => {
    loadGoogleAnalytics('G-TEST123');

    trackContactSubmitted('BUG');

    expect(dataLayerAsArrays()).toContainEqual(['event', 'contact_submitted', { category: 'BUG' }]);
  });

  it('is a no-op before gtag has been initialized', () => {
    expect(() => trackContactSubmitted('BUG')).not.toThrow();
  });
});
