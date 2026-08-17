import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppLayout } from './AppLayout';

const renderLayout = (children: ReactNode) =>
  render(
    <MemoryRouter>
      <AppLayout>{children}</AppLayout>
    </MemoryRouter>,
  );

describe('AppLayout', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the routed screen inside the main cabinet area', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getByRole('main')).toHaveTextContent('SCREEN CONTENT');
  });

  it('carries the ground band and its links on every screen', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^terms$/i })).toBeInTheDocument();
  });

  it('carries the brand header on every screen', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getByRole('link', { name: /eduparty/i })).toHaveAttribute('href', '/');
  });

  it('renders no lateral ad spaces until a real AdSense publisher ID is configured (#90)', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.queryAllByTestId('ad-slot')).toHaveLength(0);
  });

  it('renders the two lateral ad spaces reserved for desktop once a publisher ID is configured', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getAllByTestId('ad-slot')).toHaveLength(2);
  });

  it('hides the ad spaces from assistive tech since they are decorative placeholders', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    renderLayout(<p>SCREEN CONTENT</p>);

    for (const slot of screen.getAllByTestId('ad-slot')) {
      expect(slot).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
