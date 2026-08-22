import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { StopGuideScreen } from './StopGuideScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderGuide = () =>
  render(
    <MemoryRouter>
      <StopGuideScreen />
    </MemoryRouter>,
  );

describe('STOP guide screen', () => {
  it('explains what STOP is and how a round runs in EduParty', () => {
    renderGuide();

    expect(screen.getByRole('heading', { name: /^stop$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what stop is/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /how it works in eduparty/i })).toBeInTheDocument();
    expect(screen.getAllByText(/categories/i).length).toBeGreaterThan(0);
  });

  it('mentions the duplicate-vs-unique scoring the Host confirms', () => {
    renderGuide();

    expect(screen.getByText(/5 points.*10/i)).toBeInTheDocument();
  });

  it('offers a way to create or join a room', async () => {
    const user = userEvent.setup();
    renderGuide();

    await user.click(screen.getByRole('button', { name: /create a room/i }));
    expect(navigate).toHaveBeenCalledWith('/host');

    await user.click(screen.getByRole('button', { name: /join a room/i }));
    expect(navigate).toHaveBeenCalledWith('/play');
  });

  it('links to the other guides, but not to itself', () => {
    renderGuide();

    expect(screen.getByRole('link', { name: /how to play taboo/i })).toHaveAttribute(
      'href',
      '/guides/taboo',
    );
    expect(screen.queryByRole('link', { name: /how to play stop/i })).not.toBeInTheDocument();
  });
});
