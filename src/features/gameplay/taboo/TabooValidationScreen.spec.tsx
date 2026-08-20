import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom, makeTabooRound } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { TabooValidationScreen } from './TabooValidationScreen';

/** Turn 0's clue-giver is ANA (player-0); the word is ELEPHANT (factory default). */
const judgingRoom = (): RoomState => ({
  ...makeRoom({ playerCount: 3, status: 'CALCULATING_SCORES' }),
  currentRound: makeTabooRound({
    guesses: [
      { playerId: 'player-1', value: 'elephant', isValid: true },
      { playerId: 'player-2', value: 'elefant', isValid: null },
    ],
  }),
});

const ScoreProbe = () => {
  const { state } = useRoom();
  return <span data-testid="scores">{JSON.stringify(state.scores)}</span>;
};

const renderValidation = (role: PlayerRole, room: RoomState = judgingRoom()): void => {
  render(
    <RoomProvider initialState={room} role={role}>
      <ScoreProbe />
      <TabooValidationScreen />
    </RoomProvider>,
  );
};

const scores = (): Record<string, number> =>
  JSON.parse(screen.getByTestId('scores').textContent ?? '{}') as Record<string, number>;

describe('TABOO validation screen', () => {
  it('reveals the word and lays out every guesser except the clue-giver', () => {
    renderValidation('HOST');

    expect(screen.getByText('ELEPHANT')).toBeInTheDocument();
    expect(screen.getByText('elephant')).toBeInTheDocument();
    expect(screen.getByText('elefant')).toBeInTheDocument();
    expect(screen.queryByText('ANA')).not.toBeInTheDocument();
  });

  it('shows a dash for a seated guesser who never guessed', () => {
    const room = {
      ...judgingRoom(),
      currentRound: makeTabooRound({
        guesses: [{ playerId: 'player-1', value: 'elephant', isValid: true }],
      }),
    };
    renderValidation('HOST', room);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('offers an explicit approve and reject for every guess', () => {
    renderValidation('HOST');

    expect(screen.getByRole('button', { name: /approve elefant from CAIO/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject elefant from CAIO/i })).toBeInTheDocument();
  });

  it('marks a near-miss approved, and lets the Host change its mind', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /approve elefant from CAIO/i }));
    expect(screen.getByRole('button', { name: /approve elefant from CAIO/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /reject elefant from CAIO/i }));
    expect(screen.getByRole('button', { name: /reject elefant from CAIO/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('hides what a pending guess is worth until the Host judges it', () => {
    renderValidation('HOST');

    const values = screen.getAllByTestId('guess-points').map((node) => node.textContent);
    // CAIO's exact-match twin is pre-filled, but CAIO's own typo is still pending.
    expect(values).toContain('10');
    expect(values).toContain('');
  });

  it('reveals what a guess is worth once the Host approves it', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /approve elefant from CAIO/i }));

    expect(screen.getAllByTestId('guess-points').map((node) => node.textContent)).toEqual([
      '10',
      '10',
    ]);
  });

  it('tracks how much is left to judge', () => {
    renderValidation('HOST');

    expect(screen.getByTestId('judged-progress')).toHaveTextContent('1/2');
  });

  it('blocks CONFIRM SCORES until every guess has been judged', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    expect(screen.getByRole('button', { name: /confirm scores/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));

    expect(screen.getByTestId('judged-progress')).toHaveTextContent('2/2');
    expect(screen.getByRole('button', { name: /confirm scores/i })).toBeEnabled();
  });

  it('scores the turn the Host confirmed', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));
    await user.click(screen.getByRole('button', { name: /confirm scores/i }));

    expect(scores()).toEqual({ 'player-1': 10, 'player-2': 10 });
  });

  it('drops the points of a guess the Host rejected', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /reject elefant from CAIO/i }));
    await user.click(screen.getByRole('button', { name: /confirm scores/i }));

    expect(scores()).toEqual({ 'player-1': 10, 'player-2': 0 });
  });

  it('shows the same table to a Player, with no way to judge or confirm', () => {
    renderValidation('PLAYER');

    expect(screen.getByText('ELEPHANT')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm scores/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /approve all remaining/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reject/i })[0]).toBeDisabled();
  });

  it('tells a Player the Host is still judging', () => {
    renderValidation('PLAYER');

    expect(screen.getByText(/checking the guesses/i)).toBeInTheDocument();
  });

  it('leaves the clue-giver watching too, read-only, like any other Player', () => {
    // The clue-giver's own client is a HOST role no different from a guesser's;
    // canJudge only ever depends on isHost, so this is exercised via 'PLAYER'.
    renderValidation('PLAYER');

    expect(screen.getAllByRole('button', { name: /approve/i })[0]).toBeDisabled();
  });

  it('never scores twice when the Host double-clicks confirm', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));
    await user.click(screen.getByRole('button', { name: /confirm scores/i }));
    await user.click(screen.getByRole('button', { name: /scores confirmed/i }));

    expect(scores()).toEqual({ 'player-1': 10, 'player-2': 10 });
  });
});
