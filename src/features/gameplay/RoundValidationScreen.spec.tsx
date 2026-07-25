import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makePlayer, makeRoom, makeRound } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { RoundValidationScreen } from './RoundValidationScreen';

const judgingRoom = (): RoomState => ({
  ...makeRoom({ playerCount: 2, status: 'CALCULATING_SCORES' }),
  currentRound: makeRound({
    phase: 'VALIDATION_PHASE',
    categories: ['ANIMAL', 'FOOD'],
    answers: [
      { playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: null },
      { playerId: 'player-1', category: 'ANIMAL', value: 'BEAR', isValid: null },
      { playerId: 'player-0', category: 'FOOD', value: 'BREAD', isValid: null },
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
      <RoundValidationScreen />
    </RoomProvider>,
  );
};

const scores = (): Record<string, number> =>
  JSON.parse(screen.getByTestId('scores').textContent ?? '{}') as Record<string, number>;

describe('STOP validation screen', () => {
  it('lays out every category with each player answer', () => {
    renderValidation('HOST');

    expect(screen.getByRole('heading', { name: 'ANIMAL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'FOOD' })).toBeInTheDocument();
    expect(screen.getAllByText('BEAR')).toHaveLength(2);
    expect(screen.getByText('BREAD')).toBeInTheDocument();
  });

  it('shows the running score next to each player while the Host judges', () => {
    const room = { ...judgingRoom(), scores: { 'player-0': 30 } };
    renderValidation('HOST', room);

    expect(screen.getAllByText(/ANA · 30/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/BRUNO · 0/)[0]).toBeInTheDocument();
  });

  it('shows a dash for a player who left the field empty', () => {
    const room = judgingRoom();
    renderValidation('HOST', room);

    // ANA answered ANIMAL but not FOOD.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('offers an explicit approve and reject for every answer', () => {
    renderValidation('HOST');

    expect(screen.getByRole('button', { name: /approve BEAR from ANA/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject BEAR from ANA/i })).toBeInTheDocument();
  });

  it('marks an answer approved, and lets the Host change its mind', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /approve BEAR from ANA/i }));
    expect(screen.getByRole('button', { name: /approve BEAR from ANA/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /reject BEAR from ANA/i }));
    expect(screen.getByRole('button', { name: /reject BEAR from ANA/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /approve BEAR from ANA/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows what each answer is worth, and updates it when one is rejected', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    // Both wrote BEAR, so each is worth half.
    expect(screen.getAllByTestId('answer-points').map((node) => node.textContent)).toContain('5');

    await user.click(screen.getByRole('button', { name: /reject BEAR from BRUNO/i }));

    // ANA's BEAR is unique again.
    expect(screen.getAllByTestId('answer-points').map((node) => node.textContent)).toContain('10');
  });

  it('tracks how much is left to judge', () => {
    renderValidation('HOST');

    expect(screen.getByTestId('judged-progress')).toHaveTextContent('0/3');
  });

  it('blocks CONFIRM SCORES until every answer has been judged', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    expect(screen.getByRole('button', { name: /confirm scores/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));

    expect(screen.getByTestId('judged-progress')).toHaveTextContent('3/3');
    expect(screen.getByRole('button', { name: /confirm scores/i })).toBeEnabled();
  });

  it('scores the round the Host confirmed, halving the duplicated word', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));
    await user.click(screen.getByRole('button', { name: /confirm scores/i }));

    // BEAR was written by both players: 5 each. BREAD was unique: 10.
    expect(scores()).toEqual({ 'player-0': 15, 'player-1': 5 });
  });

  it('drops the points of an answer the Host rejected', async () => {
    const user = userEvent.setup();
    renderValidation('HOST');

    await user.click(screen.getByRole('button', { name: /reject BEAR from BRUNO/i }));
    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));
    await user.click(screen.getByRole('button', { name: /confirm scores/i }));

    // With BRUNO's copy rejected, ANA's BEAR is unique again.
    expect(scores()).toEqual({ 'player-0': 20, 'player-1': 0 });
  });

  it('shows the same table to a Client, with no way to judge or confirm', () => {
    renderValidation('CLIENT');

    expect(screen.getByRole('heading', { name: 'ANIMAL' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm scores/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /approve all remaining/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reject/i })[0]).toBeDisabled();
  });

  it('tells the Client the Host is still judging', () => {
    renderValidation('CLIENT');

    expect(screen.getByText(/checking the answers/i)).toBeInTheDocument();
  });

  it('never scores twice when the Host double-clicks confirm', async () => {
    const user = userEvent.setup();
    const room = {
      ...judgingRoom(),
      slots: [makePlayer(0), makePlayer(1), null, null, null, null],
    };
    renderValidation('HOST', room);

    await user.click(screen.getByRole('button', { name: /approve all remaining/i }));
    await user.click(screen.getByRole('button', { name: /confirm scores/i }));
    await user.click(screen.getByRole('button', { name: /scores confirmed/i }));

    expect(scores()).toEqual({ 'player-0': 15, 'player-1': 5 });
  });
});
