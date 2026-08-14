import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { LegalScreen } from './LegalScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderLegal = () =>
  render(
    <MemoryRouter>
      <LegalScreen />
    </MemoryRouter>,
  );

describe('Legal screen', () => {
  it('names EduParty on the copyright line', () => {
    renderLegal();

    expect(screen.getByText(/© 2026 eduparty/i)).toBeInTheDocument();
  });

  it('carries a Privacy Policy section a footer link can jump to', () => {
    renderLegal();

    const heading = screen.getByRole('heading', { name: /privacy policy/i });
    expect(heading.closest('section')).toHaveAttribute('id', 'privacy');
    expect(screen.getByText(/localStorage/i)).toBeInTheDocument();
  });

  it('carries a Terms of Service section a footer link can jump to', () => {
    renderLegal();

    const heading = screen.getByRole('heading', { name: /terms of service/i });
    expect(heading.closest('section')).toHaveAttribute('id', 'terms');
  });

  it("carries a Children's Privacy Notice section a footer link can jump to", () => {
    renderLegal();

    const heading = screen.getByRole('heading', { name: /children/i });
    expect(heading.closest('section')).toHaveAttribute('id', 'children');
  });

  it('flags itself as a plain-language summary rather than legal advice', () => {
    renderLegal();

    expect(screen.getByText(/not legal advice/i)).toBeInTheDocument();
  });

  it('sends a reader back to the front door', async () => {
    const user = userEvent.setup();
    renderLegal();

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(navigate).toHaveBeenCalledWith('/');
  });
});
