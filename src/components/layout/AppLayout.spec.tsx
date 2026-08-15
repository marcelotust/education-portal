import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppLayout } from './AppLayout';

const renderLayout = (children: ReactNode) =>
  render(
    <MemoryRouter>
      <AppLayout>{children}</AppLayout>
    </MemoryRouter>,
  );

describe('AppLayout', () => {
  it('renders the routed screen inside the main cabinet area', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getByRole('main')).toHaveTextContent('SCREEN CONTENT');
  });

  it('carries the ground band and its links on every screen', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
  });

  it('carries the brand header on every screen', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getByRole('link', { name: /eduparty/i })).toHaveAttribute('href', '/');
  });

  it('renders the two lateral ad spaces reserved for desktop', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    expect(screen.getAllByTestId('ad-slot')).toHaveLength(2);
  });

  it('hides the ad spaces from assistive tech since they are decorative placeholders', () => {
    renderLayout(<p>SCREEN CONTENT</p>);

    for (const slot of screen.getAllByTestId('ad-slot')) {
      expect(slot).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
