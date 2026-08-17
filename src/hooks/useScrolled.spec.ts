import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useScrolled } from './useScrolled';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
  window.dispatchEvent(new Event('scroll'));
};

describe('useScrolled', () => {
  afterEach(() => {
    setScrollY(0);
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
});
