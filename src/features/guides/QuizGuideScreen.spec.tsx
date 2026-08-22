import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { QuizGuideScreen } from './QuizGuideScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderGuide = () =>
  render(
    <MemoryRouter>
      <QuizGuideScreen />
    </MemoryRouter>,
  );

describe('QUIZ guide screen', () => {
  it('explains what QUIZ is and how a round runs in EduParty', () => {
    renderGuide();

    expect(screen.getByRole('heading', { name: /^quiz$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what quiz is/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /how it works in eduparty/i })).toBeInTheDocument();
    expect(screen.getByText(/a1\/a2/i)).toBeInTheDocument();
  });

  it('mentions the correct-plus-speed scoring', () => {
    renderGuide();

    expect(screen.getByText(/10 points/i)).toBeInTheDocument();
    expect(screen.getByText(/5-point bonus/i)).toBeInTheDocument();
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
    expect(screen.queryByRole('link', { name: /how to play quiz/i })).not.toBeInTheDocument();
  });
});
