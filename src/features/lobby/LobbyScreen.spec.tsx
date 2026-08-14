import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { LobbyScreen } from './LobbyScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

/** Test-only probe: exposes the FSM state so specs can assert transitions. */
const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

const renderLobby = (role: PlayerRole, room: RoomState = makeRoom()): void => {
  render(
    <MemoryRouter>
      <RoomProvider initialState={room} role={role}>
        <StatusProbe />
        <LobbyScreen />
      </RoomProvider>
    </MemoryRouter>,
  );
};

const status = () => screen.getByTestId('room-status').textContent;

describe('Lobby feature', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  describe('leaving the lobby', () => {
    it('sends the Host back to the start page', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /back to start/i }));

      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('sends a Player back to the start page too', async () => {
      const user = userEvent.setup();
      renderLobby('PLAYER');

      await user.click(screen.getByRole('button', { name: /back to start/i }));

      expect(navigate).toHaveBeenCalledWith('/');
    });
  });

  describe('character select board', () => {
    it('always renders the 6 slots of the room', () => {
      renderLobby('HOST', makeRoom({ playerCount: 2 }));

      expect(screen.getAllByTestId(/^player-slot-/)).toHaveLength(6);
    });

    it('shows the nickname of connected players and marks the open slots as free', () => {
      renderLobby('PLAYER', makeRoom({ playerCount: 2 }));

      expect(screen.getByText('ANA')).toBeInTheDocument();
      expect(screen.getByText('BRUNO')).toBeInTheDocument();
      expect(screen.getAllByText('OPEN')).toHaveLength(4);
    });

    it('shows how many of the 6 seats are taken', () => {
      renderLobby('HOST', makeRoom({ playerCount: 4 }));

      expect(screen.getByText('4/6 PLAYERS')).toBeInTheDocument();
    });

    it('carries the score of each player into the next round', () => {
      const room = { ...makeRoom({ playerCount: 2 }), scores: { 'player-0': 30, 'player-1': 20 } };
      renderLobby('PLAYER', room);

      expect(screen.getByTestId('player-slot-0')).toHaveTextContent('30');
      expect(screen.getByTestId('player-slot-1')).toHaveTextContent('20');
    });

    it('shows zero for a player who has not scored yet', () => {
      renderLobby('PLAYER', makeRoom({ playerCount: 2 }));

      expect(screen.getByTestId('player-slot-0')).toHaveTextContent('0');
    });

    it('marks the player leading the session', () => {
      const room = { ...makeRoom({ playerCount: 3 }), scores: { 'player-0': 10, 'player-1': 40 } };
      renderLobby('PLAYER', room);

      expect(screen.getByTestId('player-slot-1')).toHaveAttribute('data-leader', 'true');
      expect(screen.getByTestId('player-slot-0')).toHaveAttribute('data-leader', 'false');
    });

    it('crowns nobody while everyone is still on zero', () => {
      renderLobby('PLAYER', makeRoom({ playerCount: 3 }));

      expect(screen.getByTestId('player-slot-0')).toHaveAttribute('data-leader', 'false');
    });

    it('keeps the last round result visible after the scoreboard is gone', () => {
      const room = {
        ...makeRoom({ playerCount: 2 }),
        scores: { 'player-0': 30, 'player-1': 45 },
        lastRoundPoints: { 'player-0': 10, 'player-1': 25 },
      };
      renderLobby('PLAYER', room);

      const standings = screen.getByTestId('last-round-standings');
      expect(standings).toHaveTextContent('BRUNO');
      expect(standings).toHaveTextContent('+25');
      expect(standings).toHaveTextContent('+10');
    });

    it('ranks the standings by total, not by seat', () => {
      const room = {
        ...makeRoom({ playerCount: 2 }),
        scores: { 'player-0': 30, 'player-1': 45 },
        lastRoundPoints: { 'player-0': 10, 'player-1': 25 },
      };
      renderLobby('PLAYER', room);

      const names = within(screen.getByTestId('last-round-standings'))
        .getAllByRole('listitem')
        .map((row) => row.textContent);
      expect(names[0]).toContain('BRUNO');
      expect(names[1]).toContain('ANA');
    });

    it('shows no standings before the first round has been scored', () => {
      renderLobby('PLAYER', makeRoom({ playerCount: 2 }));

      expect(screen.queryByTestId('last-round-standings')).not.toBeInTheDocument();
    });

    it('shows the room PIN so Players can join', () => {
      renderLobby('HOST');

      expect(screen.getByText('ABCD')).toBeInTheDocument();
    });
  });

  describe('Host (write permissions)', () => {
    it('moves from LOBBY_IDLE to CONFIGURING_GAME when the Host opens the cartridge list', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');
      expect(status()).toBe('LOBBY_IDLE');

      await user.click(screen.getByRole('button', { name: /select game/i }));

      expect(status()).toBe('CONFIGURING_GAME');
      expect(screen.getByRole('button', { name: /^stop$/i })).toBeInTheDocument();
    });

    it('keeps the start action blocked until a cartridge is selected', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      expect(screen.getByRole('button', { name: /start game/i })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: /^stop$/i }));
      expect(screen.getByRole('button', { name: /start game/i })).toBeEnabled();
    });

    it('transitions CONFIGURING_GAME -> PLAYING_AD when the Host starts the selected game', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      await user.click(screen.getByRole('button', { name: /^stop$/i }));
      await user.click(screen.getByRole('button', { name: /start game/i }));

      expect(status()).toBe('PLAYING_AD');
    });

    it('reveals the match setup once a cartridge is chosen', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      expect(screen.queryByRole('button', { name: /60 seconds/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /^stop$/i }));

      expect(screen.getByRole('button', { name: /60 seconds/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: /^ANIMAL$/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('lets the Host change the round length', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      await user.click(screen.getByRole('button', { name: /^stop$/i }));
      await user.click(screen.getByRole('button', { name: /90 seconds/i }));

      expect(screen.getByRole('button', { name: /90 seconds/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: /60 seconds/i })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('blocks the start until four categories are picked', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      await user.click(screen.getByRole('button', { name: /^stop$/i }));
      // The default four are enough; dropping one must block the start.
      await user.click(screen.getByRole('button', { name: /^ANIMAL$/ }));

      expect(screen.getByRole('button', { name: /start game/i })).toBeDisabled();
      expect(screen.getByRole('status')).toHaveTextContent(/pick 1 more/i);

      await user.click(screen.getByRole('button', { name: /^CITY$/ }));

      expect(screen.getByRole('button', { name: /start game/i })).toBeEnabled();
    });

    it('goes back to LOBBY_IDLE when the Host cancels the configuration', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      await user.click(screen.getByRole('button', { name: /^back$/i }));

      expect(status()).toBe('LOBBY_IDLE');
      expect(screen.getByRole('button', { name: /select game/i })).toBeInTheDocument();
    });
  });

  describe('new match', () => {
    const playedRoom = (): RoomState => ({
      ...makeRoom({ playerCount: 2 }),
      scores: { 'player-0': 30, 'player-1': 45 },
      lastRoundPoints: { 'player-0': 10, 'player-1': 25 },
    });

    it('offers a new match to the Host once there is something to clear', () => {
      renderLobby('HOST', playedRoom());

      expect(screen.getByRole('button', { name: /new match/i })).toBeInTheDocument();
    });

    it('keeps it out of the way while the room has never scored', () => {
      renderLobby('HOST', makeRoom({ playerCount: 2 }));

      expect(screen.queryByRole('button', { name: /new match/i })).not.toBeInTheDocument();
    });

    it('never lets a Player reset the class', () => {
      renderLobby('PLAYER', playedRoom());

      expect(screen.queryByRole('button', { name: /new match/i })).not.toBeInTheDocument();
    });

    it('asks before wiping: one tap changes nothing', async () => {
      const user = userEvent.setup();
      renderLobby('HOST', playedRoom());

      await user.click(screen.getByRole('button', { name: /new match/i }));

      expect(screen.getByTestId('player-slot-0')).toHaveTextContent('30');
      expect(screen.getByTestId('last-round-standings')).toBeInTheDocument();
    });

    it('zeroes every score once the Host confirms, and drops the old standings', async () => {
      const user = userEvent.setup();
      renderLobby('HOST', playedRoom());

      await user.click(screen.getByRole('button', { name: /new match/i }));
      await user.click(screen.getByRole('button', { name: /zero the scores/i }));

      expect(screen.getByTestId('player-slot-0')).toHaveTextContent('0');
      expect(screen.getByTestId('player-slot-1')).toHaveTextContent('0');
      expect(screen.queryByTestId('last-round-standings')).not.toBeInTheDocument();
      // The room outlives the match: same PIN, same people.
      expect(screen.getByText('ABCD')).toBeInTheDocument();
      expect(screen.getByText('ANA')).toBeInTheDocument();
    });

    it('leaves the scores alone when the Host backs out', async () => {
      const user = userEvent.setup();
      renderLobby('HOST', playedRoom());

      await user.click(screen.getByRole('button', { name: /new match/i }));
      await user.click(screen.getByRole('button', { name: /keep them/i }));

      expect(screen.getByTestId('player-slot-0')).toHaveTextContent('30');
      expect(screen.getByRole('button', { name: /new match/i })).toBeInTheDocument();
    });
  });

  describe('Player (read-only listener)', () => {
    it('never renders the Host controls', () => {
      renderLobby('PLAYER');

      expect(screen.queryByRole('button', { name: /select game/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument();
    });

    it('shows a waiting message while the room is idle', () => {
      renderLobby('PLAYER');

      expect(screen.getByText(/waiting for the Host/i)).toBeInTheDocument();
    });

    it('sees the same cartridge shelf as the Host, but cannot touch it', () => {
      renderLobby('PLAYER', makeRoom({ status: 'CONFIGURING_GAME' }));

      expect(status()).toBe('CONFIGURING_GAME');
      expect(screen.getByText(/choosing the game/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^stop$/i })).toBeDisabled();
    });

    it('shows which cartridge the Host has picked', () => {
      const room = { ...makeRoom({ status: 'CONFIGURING_GAME' }), selectedGameId: 'STOP' as const };
      renderLobby('PLAYER', room);

      expect(screen.getByRole('button', { name: /^stop$/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('watches the match setup take shape, without being able to change it', async () => {
      const user = userEvent.setup();
      const room = {
        ...makeRoom({ status: 'CONFIGURING_GAME' }),
        selectedGameId: 'STOP' as const,
        gameSetup: {
          game: 'STOP' as const,
          roundDurationSeconds: 90 as const,
          categories: ['NAME', 'ANIMAL', 'FOOD'],
        },
      };
      renderLobby('PLAYER', room);

      expect(screen.getByRole('button', { name: /90 seconds/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: /^ANIMAL$/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /30 seconds/i })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: /^CITY$/ }));

      expect(screen.getByRole('button', { name: /^CITY$/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('keeps the room untouched when a Player clicks the disabled cartridge', async () => {
      const user = userEvent.setup();
      renderLobby('PLAYER', makeRoom({ status: 'CONFIGURING_GAME' }));

      await user.click(screen.getByRole('button', { name: /^stop$/i }));

      expect(status()).toBe('CONFIGURING_GAME');
      expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument();
    });
  });
});
