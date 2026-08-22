import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { TabooGuideScreen } from './TabooGuideScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderGuide = () =>
  render(
    <MemoryRouter>
      <TabooGuideScreen />
    </MemoryRouter>,
  );

describe('TABOO guide screen', () => {
  it('explains what TABOO is and how a round runs in EduParty', () => {
    renderGuide();

    expect(screen.getByRole('heading', { name: /^taboo$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what taboo is/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /how it works in eduparty/i })).toBeInTheDocument();
    expect(screen.getAllByText(/clue-giver/i).length).toBeGreaterThan(0);
  });

  it('mentions the validation step as a near-miss safety net', () => {
    renderGuide();

    expect(screen.getByText(/host reviews the guesses/i)).toBeInTheDocument();
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

    expect(screen.getByRole('link', { name: /how to play stop/i })).toHaveAttribute(
      'href',
      '/guides/stop',
    );
    expect(screen.getByRole('link', { name: /how to play quiz/i })).toHaveAttribute(
      'href',
      '/guides/quiz',
    );
    expect(screen.queryByRole('link', { name: /how to play taboo/i })).not.toBeInTheDocument();
  });
});
