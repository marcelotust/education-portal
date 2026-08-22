import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AboutScreen } from './AboutScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderAbout = () =>
  render(
    <MemoryRouter>
      <AboutScreen />
    </MemoryRouter>,
  );

describe('About screen', () => {
  it("carries a 'why this exists' section", () => {
    renderAbout();

    expect(screen.getByRole('heading', { name: /why eduparty exists/i })).toBeInTheDocument();
    expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/indie maker/i)).toBeInTheDocument();
  });

  it('names every differentiator', () => {
    renderAbout();

    expect(screen.getByText(/no screen-share, ever/i)).toBeInTheDocument();
    expect(screen.getByText(/one scoreboard across every game/i)).toBeInTheDocument();
    expect(screen.getByText(/not just auto-grading/i)).toBeInTheDocument();
    expect(screen.getByText(/built for esl, kept current/i)).toBeInTheDocument();
    expect(screen.getByText(/looks like a game, not a dashboard/i)).toBeInTheDocument();
  });

  it('links out to every game guide (#149)', () => {
    renderAbout();

    expect(screen.getByRole('link', { name: /how to play taboo/i })).toHaveAttribute(
      'href',
      '/guides/taboo',
    );
    expect(screen.getByRole('link', { name: /how to play stop/i })).toHaveAttribute(
      'href',
      '/guides/stop',
    );
    expect(screen.getByRole('link', { name: /how to play quiz/i })).toHaveAttribute(
      'href',
      '/guides/quiz',
    );
  });

  it("credits the name to the maker's nephew", () => {
    renderAbout();

    expect(screen.getByRole('heading', { name: /the name/i })).toBeInTheDocument();
    expect(screen.getByText(/eduardo/i)).toBeInTheDocument();
  });

  it('offers a way to create or join a room from the page', async () => {
    const user = userEvent.setup();
    renderAbout();

    await user.click(screen.getByRole('button', { name: /create a room/i }));
    expect(navigate).toHaveBeenCalledWith('/host');

    await user.click(screen.getByRole('button', { name: /join a room/i }));
    expect(navigate).toHaveBeenCalledWith('/play');
  });

  it('sends a reader back to the front door', async () => {
    const user = userEvent.setup();
    renderAbout();

    await user.click(screen.getByRole('button', { name: /^back$/i }));

    expect(navigate).toHaveBeenCalledWith('/');
  });
});
