import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import * as analytics from '@/lib/analytics';
import { makeBotPlayer, makeRoom } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { ScoreboardScreen } from './ScoreboardScreen';

vi.mock('@/lib/analytics', () => ({ trackGameCompleted: vi.fn() }));

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
    <MemoryRouter>
      <RoomProvider initialState={room} role={role}>
        <StatusProbe />
        <ScoreboardScreen />
      </RoomProvider>
    </MemoryRouter>,
  );
};

describe('Scoreboard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  // Every participant's browser mounts this screen once the FSM state
  // syncs, so only the Host may fire the completion event — otherwise one
  // finished game would count once per person in the room.
  it('logs the game as completed for the Host', () => {
    renderScoreboard('HOST');

    expect(analytics.trackGameCompleted).toHaveBeenCalledTimes(1);
    expect(analytics.trackGameCompleted).toHaveBeenCalledWith(false, false);
  });

  describe('after a solo round (#156)', () => {
    const soloStandings = (): RoomState => {
      const room = makeRoom({ playerCount: 1, status: 'CALCULATING_SCORES' });
      return {
        ...room,
        slots: room.slots.map((slot) => (slot ? { ...slot, role: 'HOST' } : slot)),
        scores: { 'player-0': 30 },
        lastRoundPoints: { 'player-0': 30 },
      };
    };

    it('tags the completion as solo', () => {
      renderScoreboard('HOST', soloStandings());

      expect(analytics.trackGameCompleted).toHaveBeenCalledWith(true, false);
    });

    it('invites the Host to bring more players', () => {
      renderScoreboard('HOST', soloStandings());

      expect(screen.getByText(/stop is better with more people/i)).toBeInTheDocument();
    });

    it('stays quiet when other players were in the round', () => {
      renderScoreboard('HOST');

      expect(screen.queryByText(/stop is better with more people/i)).not.toBeInTheDocument();
    });
  });

  it('does not log a completion for a Player — the Host already did', () => {
    renderScoreboard('PLAYER');

    expect(analytics.trackGameCompleted).not.toHaveBeenCalled();
  });

  describe('with the bot at the table (#155)', () => {
    const withBot = (scores: Record<string, number>): RoomState => ({
      ...makeRoom({ playerCount: 1, status: 'CALCULATING_SCORES', bot: makeBotPlayer() }),
      slots: makeRoom({ playerCount: 1 }).slots.map((slot) =>
        slot ? { ...slot, role: 'HOST' as const } : slot,
      ),
      scores,
      lastRoundPoints: scores,
    });

    it('ranks the bot among the players once it has scored', () => {
      renderScoreboard('HOST', withBot({ 'player-0': 10, 'bot:1': 25 }));

      const rows = screen.getAllByTestId('scoreboard-row');
      expect(rows[0]).toHaveTextContent('BOT');
      expect(rows[1]).toHaveTextContent('ANA');
    });

    it('leaves a bot that sat out the round off the board', () => {
      renderScoreboard('HOST', withBot({ 'player-0': 10 }));

      expect(screen.getAllByTestId('scoreboard-row')).toHaveLength(1);
    });

    it('tags the completion as solo with a bot', () => {
      renderScoreboard('HOST', withBot({ 'player-0': 10, 'bot:1': 25 }));

      expect(analytics.trackGameCompleted).toHaveBeenCalledWith(true, true);
    });
  });

  it('ranks players by score, highest first', () => {
    renderScoreboard('PLAYER');

    const rows = screen.getAllByTestId('scoreboard-row');
    expect(rows[0]).toHaveTextContent('ANA');
    expect(rows[1]).toHaveTextContent('BRUNO');
  });

  it('gives this quiet moment somewhere for an ad, everyone included, Host or not (#18)', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
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

  it('offers a way to send a suggestion or report a bug', () => {
    renderScoreboard('PLAYER');

    expect(screen.getByRole('link', { name: /suggestion or found a bug/i })).toHaveAttribute(
      'href',
      '/contact',
    );
  });
});
