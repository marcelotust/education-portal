import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Header } from './Header';

describe('Header', () => {
  it('shows the brand mark and links back to the front door', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /eduparty/i });
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByRole('img', { name: /eduparty/i })).toBeInTheDocument();
  });
});
