import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { Header } from './Header';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
  window.dispatchEvent(new Event('scroll'));
};

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe('Header', () => {
  afterEach(() => {
    setScrollY(0);
  });

  it('shows the brand mark and links back to the front door', () => {
    renderHeader();

    const link = screen.getByRole('link', { name: /eduparty/i });
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByRole('img', { name: /eduparty/i })).toBeInTheDocument();
  });

  it('shrinks the logo once the page scrolls', () => {
    renderHeader();
    const logo = screen.getByRole('img', { name: /eduparty/i });
    const fullSizeClasses = logo.className;

    act(() => setScrollY(100));

    expect(logo.className).not.toBe(fullSizeClasses);
  });

  it('publishes its rendered height as a CSS variable for other sticky chrome', () => {
    renderHeader();

    expect(document.documentElement.style.getPropertyValue('--header-height')).not.toBe('');
  });
});
