import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe('Footer', () => {
  it('carries a copyright line and links to the legal notices', () => {
    renderFooter();

    expect(screen.getByText(/© 2026 eduparty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute(
      'href',
      '/legal#privacy',
    );
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute(
      'href',
      '/legal#terms',
    );
    expect(screen.getByRole('link', { name: /children's privacy/i })).toHaveAttribute(
      'href',
      '/legal#children',
    );
    expect(screen.getByRole('link', { name: /suggestions.*bug reports/i })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('renders as a landmark so it reads as page-level chrome, not screen content', () => {
    renderFooter();

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
