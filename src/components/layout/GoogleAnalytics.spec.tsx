import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GoogleAnalytics } from './GoogleAnalytics';
import * as analytics from '@/lib/analytics';

vi.mock('@/lib/analytics', () => ({
  loadGoogleAnalytics: vi.fn(),
  trackPageView: vi.fn(),
}));

const NavigateButton = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        void navigate(to);
      }}
    >
      go
    </button>
  );
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('GoogleAnalytics', () => {
  it('renders nothing — it is a side-effect-only bridge', () => {
    const { container } = render(
      <MemoryRouter>
        <GoogleAnalytics />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('does not load gtag until a measurement ID is configured (#91)', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');

    render(
      <MemoryRouter>
        <GoogleAnalytics />
      </MemoryRouter>,
    );

    expect(analytics.loadGoogleAnalytics).not.toHaveBeenCalled();
    expect(analytics.trackPageView).not.toHaveBeenCalled();
  });

  it('loads gtag and tracks the initial page once a measurement ID is configured', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123');

    render(
      <MemoryRouter initialEntries={['/host']}>
        <GoogleAnalytics />
      </MemoryRouter>,
    );

    expect(analytics.loadGoogleAnalytics).toHaveBeenCalledWith('G-TEST123');
    expect(analytics.trackPageView).toHaveBeenCalledWith('/host');
  });

  it('tracks a new page_view on every SPA route change', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123');
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleAnalytics />
        <NavigateButton to="/play" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'go' }));

    expect(analytics.trackPageView).toHaveBeenLastCalledWith('/play');
  });
});
