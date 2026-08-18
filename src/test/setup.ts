import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  // jsdom has no layout engine and doesn't implement this; stub it so
  // effects that call it don't throw, and so specs can assert on it.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
});
