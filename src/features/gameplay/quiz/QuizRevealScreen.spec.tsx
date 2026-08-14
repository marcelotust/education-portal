import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeQuizRound, makeRoom } from '@/test/factories';
import type { PlayerRole, QuizRound, RoomState } from '@/types';
import { QuizRevealScreen } from './QuizRevealScreen';

const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

/** The reveal of question 1 of 3: ANA got it, BRUNO did not. */
const revealing = (round: Partial<QuizRound> = {}): RoomState => ({
  ...makeRoom({ playerCount: 2, status: 'SHOWING_ANSWER' }),
  scores: { 'player-0': 15, 'player-1': 0 },
  currentRound: makeQuizRound({
    answers: [
      { playerId: 'player-0', choice: 1, elapsedMs: 900 },
      { playerId: 'player-1', choice: 0, elapsedMs: 1500 },
    ],
    questionPoints: { 'player-0': 15, 'player-1': 0 },
    matchPoints: { 'player-0': 15, 'player-1': 0 },
    ...round,
  }),
});

const renderReveal = (role: PlayerRole, room: RoomState = revealing()): void => {
  render(
    <RoomProvider initialState={room} role={role}>
      <StatusProbe />
      <QuizRevealScreen />
    </RoomProvider>,
  );
};

const status = () => screen.getByTestId('room-status').textContent;

describe('QUIZ reveal', () => {
  it('finally tells everyone what the right answer was', () => {
    renderReveal('PLAYER');

    expect(screen.getByTestId('correct-option')).toHaveTextContent('Mercury');
  });

  it('shows who picked each option, right or wrong', () => {
    renderReveal('PLAYER');

    expect(screen.getByTestId('option-voters-1')).toHaveTextContent('ANA');
    expect(screen.getByTestId('option-voters-0')).toHaveTextContent('BRUNO');
    expect(screen.queryByTestId('option-voters-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('option-voters-3')).not.toBeInTheDocument();
  });

  it('calls out a player who never answered instead of hiding them', () => {
    renderReveal(
      'PLAYER',
      revealing({ answers: [{ playerId: 'player-0', choice: 1, elapsedMs: 900 }] }),
    );

    expect(screen.getByTestId('no-answer-players')).toHaveTextContent('BRUNO');
  });

  it('shows what the question was worth to each player', () => {
    renderReveal('PLAYER');

    const ana = screen.getByTestId('reveal-row-player-0');
    expect(ana).toHaveTextContent('ANA');
    expect(ana).toHaveTextContent('+15');
    expect(screen.getByTestId('reveal-row-player-1')).toHaveTextContent('—');
  });

  it('says where the match is up to', () => {
    renderReveal('PLAYER');

    expect(screen.getByTestId('question-progress')).toHaveTextContent('1/3');
  });

  it('lets the Host take the class to the next question when they are ready', async () => {
    const user = userEvent.setup();
    renderReveal('HOST');

    await user.click(screen.getByRole('button', { name: /next question/i }));

    expect(status()).toBe('PLAYING');
  });

  it('ends the match instead of asking a fourth question', async () => {
    const user = userEvent.setup();
    renderReveal('HOST', revealing({ currentIndex: 2 }));

    expect(screen.queryByRole('button', { name: /next question/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /scoreboard/i }));

    expect(status()).toBe('CALCULATING_SCORES');
  });

  it('leaves a Player waiting, with nothing to press', () => {
    renderReveal('PLAYER');

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for the Host/i)).toBeInTheDocument();
  });
});
