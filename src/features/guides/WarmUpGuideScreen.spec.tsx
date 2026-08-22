import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { WarmUpGuideScreen } from './WarmUpGuideScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderGuide = () =>
  render(
    <MemoryRouter>
      <WarmUpGuideScreen />
    </MemoryRouter>,
  );

describe('Warm-up guide screen', () => {
  it('recommends STOP and QUIZ for a short warm-up', () => {
    renderGuide();

    expect(screen.getByRole('heading', { name: /warm-ups/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /stop \/ categories/i })).toHaveAttribute(
      'href',
      '/guides/stop',
    );
    expect(screen.getByRole('link', { name: 'QUIZ' })).toHaveAttribute('href', '/guides/quiz');
  });

  it('notes TABOO fits better as a main activity than a warm-up', () => {
    renderGuide();

    expect(screen.getByText(/works better as a main activity/i)).toBeInTheDocument();
  });

  it('offers a way to create or join a room', async () => {
    const user = userEvent.setup();
    renderGuide();

    await user.click(screen.getByRole('button', { name: /create a room/i }));
    expect(navigate).toHaveBeenCalledWith('/host');

    await user.click(screen.getByRole('button', { name: /join a room/i }));
    expect(navigate).toHaveBeenCalledWith('/play');
  });
});
