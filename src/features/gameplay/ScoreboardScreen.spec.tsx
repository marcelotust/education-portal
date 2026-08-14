import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { ScoreboardScreen } from './ScoreboardScreen';

const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

const standings = (): RoomState => ({
  ...makeRoom({ playerCount: 2, status: 'CALCULATING_SCORES' }),
  scores: { 'player-0': 20, 'player-1': 10 },
  lastRoundPoints: { 'player-0': 15, 'player-1': 0 },
});

const renderScoreboard = (role: PlayerRole, room: RoomState = standings()): void => {
  render(
    <RoomProvider initialState={room} role={role}>
      <StatusProbe />
      <ScoreboardScreen />
    </RoomProvider>,
  );
};

describe('Scoreboard', () => {
  it('ranks players by score, highest first', () => {
    renderScoreboard('PLAYER');

    const rows = screen.getAllByTestId('scoreboard-row');
    expect(rows[0]).toHaveTextContent('ANA');
    expect(rows[1]).toHaveTextContent('BRUNO');
  });

  it('gives this quiet moment somewhere for an ad, everyone included, Host or not (#18)', () => {
    renderScoreboard('PLAYER');
    expect(screen.getByTestId('inline-ad-slot')).toHaveTextContent('AD SPACE');

    renderScoreboard('HOST');
    expect(screen.getAllByTestId('inline-ad-slot')).toHaveLength(2);
  });

  it('lets the Host send everyone back to the lobby', async () => {
    const user = userEvent.setup();
    renderScoreboard('HOST');

    await user.click(screen.getByRole('button', { name: /back to lobby/i }));

    expect(screen.getByTestId('room-status')).toHaveTextContent('LOBBY_IDLE');
  });

  it('leaves a Player with nothing to press', () => {
    renderScoreboard('PLAYER');

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
