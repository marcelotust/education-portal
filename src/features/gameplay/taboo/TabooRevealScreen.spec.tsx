import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom, makeTabooRound } from '@/test/factories';
import type { PlayerRole, RoomState, TabooRound } from '@/types';
import { TabooRevealScreen } from './TabooRevealScreen';

const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

/** The reveal of turn 1 of 3: ANA cleared, BRUNO is the clue-giver, CAIO missed it. */
const revealing = (round: Partial<TabooRound> = {}): RoomState => ({
  ...makeRoom({ playerCount: 3, status: 'SHOWING_ANSWER' }),
  scores: { 'player-0': 10, 'player-1': 0, 'player-2': 0 },
  currentRound: makeTabooRound({
    currentIndex: 1,
    guesses: [
      { playerId: 'player-0', value: 'titanic' },
      { playerId: 'player-2', value: 'wrong' },
    ],
    turnPoints: { 'player-0': 10, 'player-2': 0 },
    matchPoints: { 'player-0': 10, 'player-2': 0 },
    ...round,
  }),
});

const renderReveal = (role: PlayerRole, room: RoomState = revealing()): void => {
  render(
    <RoomProvider initialState={room} role={role}>
      <StatusProbe />
      <TabooRevealScreen />
    </RoomProvider>,
  );
};

const status = () => screen.getByTestId('room-status').textContent;

describe('TABOO reveal', () => {
  it('finally tells everyone what the word was', () => {
    renderReveal('PLAYER');

    expect(screen.getByTestId('revealed-word')).toHaveTextContent('TITANIC');
  });

  it('shows what the turn was worth to each player', () => {
    renderReveal('PLAYER');

    const ana = screen.getByTestId('reveal-row-player-0');
    expect(ana).toHaveTextContent('ANA');
    expect(ana).toHaveTextContent('+10');
    expect(screen.getByTestId('reveal-row-player-2')).toHaveTextContent('—');
  });

  it('says where the match is up to', () => {
    renderReveal('PLAYER');

    expect(screen.getByTestId('turn-progress')).toHaveTextContent('2/3');
  });

  it('lets the Host take the room to the next clue-giver when they are ready', async () => {
    const user = userEvent.setup();
    renderReveal('HOST');

    await user.click(screen.getByRole('button', { name: /next clue-giver/i }));

    expect(status()).toBe('PLAYING');
  });

  it('ends the match instead of drawing a fourth clue-giver', async () => {
    const user = userEvent.setup();
    renderReveal('HOST', revealing({ currentIndex: 2 }));

    expect(screen.queryByRole('button', { name: /next clue-giver/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /scoreboard/i }));

    expect(status()).toBe('CALCULATING_SCORES');
  });

  it('leaves a Player waiting, with nothing to press', () => {
    renderReveal('PLAYER');

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for the Host/i)).toBeInTheDocument();
  });
});
