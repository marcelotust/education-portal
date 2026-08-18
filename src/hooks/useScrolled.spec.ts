import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useScrolled } from './useScrolled';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
  window.dispatchEvent(new Event('scroll'));
};

const setLayout = ({
  scrollHeight,
  innerHeight,
}: {
  scrollHeight: number;
  innerHeight: number;
}) => {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: innerHeight,
    writable: true,
    configurable: true,
  });
};

describe('useScrolled', () => {
  afterEach(() => {
    setScrollY(0);
    setLayout({ scrollHeight: 0, innerHeight: 768 });
  });

  it('starts false at the top of the page', () => {
    const { result } = renderHook(() => useScrolled());

    expect(result.current).toBe(false);
  });

  it('flips true once the page scrolls past the enter threshold', () => {
    const { result } = renderHook(() => useScrolled());

    act(() => setScrollY(100));

    expect(result.current).toBe(true);
  });

  it('flips back false once scrolled back under the exit threshold', () => {
    const { result } = renderHook(() => useScrolled());

    act(() => setScrollY(100));
    act(() => setScrollY(0));

    expect(result.current).toBe(false);
  });

  it('stays true within the hysteresis band, so a header-collapse-driven scroll dip cannot flip it back', () => {
    const { result } = renderHook(() => useScrolled());

    act(() => setScrollY(100));
    act(() => setScrollY(20));

    expect(result.current).toBe(true);
  });

  it('does not flip true just from crossing the lower exit threshold', () => {
    const { result } = renderHook(() => useScrolled());

    act(() => setScrollY(20));

    expect(result.current).toBe(false);
  });

  it('starts true when the page is already tall enough to need scrolling, with no scroll gesture', () => {
    setLayout({ scrollHeight: 2000, innerHeight: 800 });

    const { result } = renderHook(() => useScrolled());

    expect(result.current).toBe(true);
  });

  it('stays false on mount when content fits inside the viewport', () => {
    setLayout({ scrollHeight: 600, innerHeight: 800 });

    const { result } = renderHook(() => useScrolled());

    expect(result.current).toBe(false);
  });

  it('flips true when a resize makes previously-fitting content overflow', () => {
    setLayout({ scrollHeight: 600, innerHeight: 800 });
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(false);

    act(() => {
      setLayout({ scrollHeight: 600, innerHeight: 400 });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('flips true when content grows tall enough to overflow, without a resize or navigation', async () => {
    setLayout({ scrollHeight: 600, innerHeight: 800 });
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(false);

    const node = document.createElement('div');
    await act(async () => {
      setLayout({ scrollHeight: 2000, innerHeight: 800 });
      document.body.appendChild(node);
      await Promise.resolve();
    });

    expect(result.current).toBe(true);
    document.body.removeChild(node);
  });

  it('flips overflow back off as soon as a resize makes the content fit again', () => {
    setLayout({ scrollHeight: 850, innerHeight: 800 });
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(true);

    act(() => {
      setLayout({ scrollHeight: 850, innerHeight: 900 });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(false);
  });

  it('flips overflow back off when navigating from a tall screen to one that fits, with no stale margin left over', async () => {
    setLayout({ scrollHeight: 2000, innerHeight: 800 });
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(true);

    // A route/screen swap replaces DOM nodes (unlike the header's own
    // collapse, which is just a className change) — that's what the
    // MutationObserver is watching for.
    const node = document.createElement('div');
    await act(async () => {
      setLayout({ scrollHeight: 600, innerHeight: 800 });
      document.body.appendChild(node);
      await Promise.resolve();
    });

    expect(result.current).toBe(false);
    document.body.removeChild(node);
  });
});
