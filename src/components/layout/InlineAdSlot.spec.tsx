import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InlineAdSlot } from './InlineAdSlot';

describe('InlineAdSlot', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders nothing until a real AdSense publisher ID is configured (#90)', () => {
    render(<InlineAdSlot label="AD SPACE" />);

    expect(screen.queryByTestId('inline-ad-slot')).not.toBeInTheDocument();
  });

  it('shows the label passed to it once a publisher ID is configured', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    render(<InlineAdSlot label="AD SPACE" />);

    expect(screen.getByTestId('inline-ad-slot')).toHaveTextContent('AD SPACE');
  });

  it('hides itself from assistive tech, same as the lateral AdSlot, since it is decorative', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    render(<InlineAdSlot label="AD SPACE" />);

    expect(screen.getByTestId('inline-ad-slot')).toHaveAttribute('aria-hidden', 'true');
  });
});
