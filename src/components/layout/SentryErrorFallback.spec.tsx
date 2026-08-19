import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SentryErrorFallback } from './SentryErrorFallback';

describe('Sentry error fallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tells the Player something broke, without a stack trace or blank screen', () => {
    render(<SentryErrorFallback />);

    expect(screen.getByText(/something broke/i)).toBeInTheDocument();
  });

  it('reloads the page on request', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });
    render(<SentryErrorFallback />);

    await user.click(screen.getByRole('button', { name: /reload/i }));

    expect(reload).toHaveBeenCalled();
  });
});
