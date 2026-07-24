import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renders the routed screen inside the main cabinet area', () => {
    render(
      <AppLayout>
        <p>SCREEN CONTENT</p>
      </AppLayout>,
    );

    expect(screen.getByRole('main')).toHaveTextContent('SCREEN CONTENT');
  });

  it('renders the two lateral ad spaces reserved for desktop', () => {
    render(
      <AppLayout>
        <p>SCREEN CONTENT</p>
      </AppLayout>,
    );

    expect(screen.getAllByTestId('ad-slot')).toHaveLength(2);
  });

  it('hides the ad spaces from assistive tech since they are decorative placeholders', () => {
    render(
      <AppLayout>
        <p>SCREEN CONTENT</p>
      </AppLayout>,
    );

    for (const slot of screen.getAllByTestId('ad-slot')) {
      expect(slot).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
