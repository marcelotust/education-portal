import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InlineAdSlot } from './InlineAdSlot';

describe('InlineAdSlot', () => {
  it('shows the label passed to it', () => {
    render(<InlineAdSlot label="AD SPACE" />);

    expect(screen.getByTestId('inline-ad-slot')).toHaveTextContent('AD SPACE');
  });

  it('hides itself from assistive tech, same as the lateral AdSlot, since it is decorative', () => {
    render(<InlineAdSlot label="AD SPACE" />);

    expect(screen.getByTestId('inline-ad-slot')).toHaveAttribute('aria-hidden', 'true');
  });
});
