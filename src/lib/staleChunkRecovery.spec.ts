import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { recoverFromStaleChunk } from './staleChunkRecovery';

describe('recoverFromStaleChunk', () => {
  const reload = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    reload.mockClear();
    vi.stubGlobal('location', { ...window.location, reload });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const preloadError = () => new Event('vite:preloadError', { cancelable: true });

  it('reloads the page once a stale chunk fails to load', () => {
    recoverFromStaleChunk();

    window.dispatchEvent(preloadError());

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('suppresses the original error instead of letting it reach the error boundary', () => {
    recoverFromStaleChunk();

    const event = preloadError();
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('never reloads more than once per tab, in case reloading does not fix it', () => {
    recoverFromStaleChunk();

    window.dispatchEvent(preloadError());
    window.dispatchEvent(preloadError());

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('leaves an unrelated error alone', () => {
    recoverFromStaleChunk();

    window.dispatchEvent(new Event('error'));

    expect(reload).not.toHaveBeenCalled();
  });
});
