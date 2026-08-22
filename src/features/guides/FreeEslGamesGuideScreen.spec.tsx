import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { FreeEslGamesGuideScreen } from './FreeEslGamesGuideScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderGuide = () =>
  render(
    <MemoryRouter>
      <FreeEslGamesGuideScreen />
    </MemoryRouter>,
  );

describe('Free ESL games guide screen', () => {
  it('states the screen-share problem and the no-screen-share fix', () => {
    renderGuide();

    expect(screen.getByRole('heading', { name: /free esl games/i })).toBeInTheDocument();
    expect(screen.getByText(/sharing your screen/i)).toBeInTheDocument();
  });

  it('links out to all three per-game guides', () => {
    renderGuide();

    expect(screen.getByRole('link', { name: 'TABOO' })).toHaveAttribute('href', '/guides/taboo');
    expect(screen.getByRole('link', { name: 'STOP / Categories' })).toHaveAttribute(
      'href',
      '/guides/stop',
    );
    expect(screen.getByRole('link', { name: 'QUIZ' })).toHaveAttribute('href', '/guides/quiz');
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
