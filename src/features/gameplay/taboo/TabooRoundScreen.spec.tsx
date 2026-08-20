import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { makeRoom, makeTabooRound } from '@/test/factories';
import type { RoomState, TabooGuess, TabooRound } from '@/types';
import { TabooRoundScreen } from './TabooRoundScreen';

const { sendGuess, useTabooGuessBroadcastMock } = vi.hoisted(() => ({
  sendGuess: vi.fn(),
  useTabooGuessBroadcastMock: vi.fn(),
}));

vi.mock('@/hooks/useTabooGuessBroadcast', () => ({
  useTabooGuessBroadcast: useTabooGuessBroadcastMock,
}));

/** 3 seated players; turn 0's clue-giver is player-0 (ANA). */
const playing = (round: Partial<TabooRound> = {}): RoomState => ({
  ...makeRoom({ playerCount: 3, status: 'PLAYING' }),
  currentRound: makeTabooRound({ endsAt: new Date(Date.now() + 120_000).toISOString(), ...round }),
});

const renderRound = (playerId: string, room: RoomState = playing()) =>
  render(
    <RoomProvider initialState={room} role="HOST">
      <TabooRoundScreen playerId={playerId} />
    </RoomProvider>,
  );

describe('TABOO round screen', () => {
  let receiveGuess: ((guess: TabooGuess) => void) | null = null;

  beforeEach(() => {
    sendGuess.mockClear();
    receiveGuess = null;
    useTabooGuessBroadcastMock.mockImplementation(
      ({ onGuess }: { onGuess: (guess: TabooGuess) => void }) => {
        receiveGuess = onGuess;
        return { sendGuess };
      },
    );
  });

  it('shows the clue-giver their own card, word and forbidden words included', () => {
    renderRound('player-0');

    expect(screen.getByText('ELEPHANT')).toBeInTheDocument();
    expect(screen.getByText('TRUNK')).toBeInTheDocument();
    expect(screen.queryByLabelText(/your guess/i)).not.toBeInTheDocument();
  });

  it('shows everyone else the clue-giver name and a guess form, never the word', () => {
    renderRound('player-1');

    expect(screen.getByText(/ana is explaining/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your guess/i)).toBeInTheDocument();
    expect(screen.queryByText('ELEPHANT')).not.toBeInTheDocument();
  });

  it('broadcasts a guess, not just a local submit', async () => {
    const user = userEvent.setup();
    renderRound('player-1');

    await user.type(screen.getByLabelText(/your guess/i), 'elephant');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(sendGuess).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 'player-1', value: 'elephant' }),
    );
    expect(screen.getByRole('button', { name: /guess sent/i })).toBeDisabled();
  });

  it('will not submit an empty guess', () => {
    renderRound('player-1');

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });

  it('ends the turn for everyone once both guessers have answered', async () => {
    const user = userEvent.setup();
    renderRound('player-1');

    await user.type(screen.getByLabelText(/your guess/i), 'giraffe');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // player-2 is the other guesser (player-0 is the clue-giver this turn).
    act(() => receiveGuess?.({ playerId: 'player-2', value: 'elephant', isValid: null }));

    expect(screen.getByRole('alert')).toHaveTextContent(/everyone has guessed/i);
  });
});
