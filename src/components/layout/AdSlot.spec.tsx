import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdSlot } from './AdSlot';

describe('AdSlot', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders nothing until a real AdSense publisher ID is configured (#90)', () => {
    render(<AdSlot label="AD SPACE" />);

    expect(screen.queryByTestId('ad-slot')).not.toBeInTheDocument();
  });

  it('shows the label passed to it once a publisher ID is configured', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    render(<AdSlot label="AD SPACE" />);

    expect(screen.getByTestId('ad-slot')).toHaveTextContent('AD SPACE');
  });

  it('hides itself from assistive tech since it is a decorative placeholder', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    render(<AdSlot label="AD SPACE" />);

    expect(screen.getByTestId('ad-slot')).toHaveAttribute('aria-hidden', 'true');
  });
});
