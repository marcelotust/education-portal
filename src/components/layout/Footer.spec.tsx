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
  it('carries a copyright line and links to the legal notices and contact form', () => {
    renderFooter();

    expect(screen.getByText(/© 2026 eduparty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^terms$/i })).toHaveAttribute('href', '/legal');
    expect(screen.getByRole('link', { name: /^contact$/i })).toHaveAttribute('href', '/contact');
  });

  it('renders as a landmark so it reads as page-level chrome, not screen content', () => {
    renderFooter();

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
