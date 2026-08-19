import { afterEach, describe, expect, it, vi } from 'vitest';

// ESM named exports aren't spy-able in place (see vitest's browser-mode
// limitations doc), so the SDK is mocked wholesale instead of spied on.
const { init, setTag, browserTracingIntegration } = vi.hoisted(() => ({
  init: vi.fn(),
  setTag: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
}));

vi.mock('@sentry/react', () => ({ init, setTag, browserTracingIntegration }));

const { initSentry, tagRoomContext } = await import('./sentry');

afterEach(() => {
  vi.clearAllMocks();
});

describe('initSentry', () => {
  it('does not throw, and does not initialize the SDK, when the DSN is empty', () => {
    expect(() => initSentry('')).not.toThrow();

    expect(init).not.toHaveBeenCalled();
  });

  it('initializes the SDK with the given DSN', () => {
    initSentry('https://examplePublicKey@o0.ingest.sentry.io/0');

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' }),
    );
  });
});

describe('tagRoomContext', () => {
  it('tags the role as given', () => {
    tagRoomContext('HOST', 'KPZT');

    expect(setTag).toHaveBeenCalledWith('role', 'HOST');
  });

  it('never sends the raw PIN, only a hash of it', () => {
    tagRoomContext('HOST', 'KPZT');

    const pinTag = setTag.mock.calls.find(([key]) => key === 'roomPin');
    expect(pinTag?.[1]).not.toBe('KPZT');
    expect(pinTag?.[1]).not.toContain('KPZT');
  });

  it('hashes the same PIN to the same tag every time', () => {
    tagRoomContext('HOST', 'KPZT');
    const first = setTag.mock.calls.find(([key]) => key === 'roomPin')?.[1];
    setTag.mockClear();
    tagRoomContext('PLAYER', 'KPZT');
    const second = setTag.mock.calls.find(([key]) => key === 'roomPin')?.[1];

    expect(first).toBe(second);
  });
});
