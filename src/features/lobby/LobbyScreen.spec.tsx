import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { LobbyScreen } from './LobbyScreen';

/** Test-only probe: exposes the FSM state so specs can assert transitions. */
const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

const renderLobby = (role: PlayerRole, room: RoomState = makeRoom()): void => {
  render(
    <RoomProvider initialState={room} role={role}>
      <StatusProbe />
      <LobbyScreen />
    </RoomProvider>,
  );
};

const status = () => screen.getByTestId('room-status').textContent;

describe('Lobby feature', () => {
  describe('character select board', () => {
    it('always renders the 6 slots of the room', () => {
      renderLobby('HOST', makeRoom({ playerCount: 2 }));

      expect(screen.getAllByTestId(/^player-slot-/)).toHaveLength(6);
    });

    it('shows the nickname of connected players and marks the open slots as free', () => {
      renderLobby('CLIENT', makeRoom({ playerCount: 2 }));

      expect(screen.getByText('ANA')).toBeInTheDocument();
      expect(screen.getByText('BRUNO')).toBeInTheDocument();
      expect(screen.getAllByText('OPEN')).toHaveLength(4);
    });

    it('shows how many of the 6 seats are taken', () => {
      renderLobby('HOST', makeRoom({ playerCount: 4 }));

      expect(screen.getByText('4/6 PLAYERS')).toBeInTheDocument();
    });

    it('shows the room PIN so students can join', () => {
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

    it('goes back to LOBBY_IDLE when the Host cancels the configuration', async () => {
      const user = userEvent.setup();
      renderLobby('HOST');

      await user.click(screen.getByRole('button', { name: /select game/i }));
      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(status()).toBe('LOBBY_IDLE');
      expect(screen.getByRole('button', { name: /select game/i })).toBeInTheDocument();
    });
  });

  describe('Client (read-only listener)', () => {
    it('never renders the Host controls', () => {
      renderLobby('CLIENT');

      expect(screen.queryByRole('button', { name: /select game/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument();
    });

    it('shows a waiting message while the room is idle', () => {
      renderLobby('CLIENT');

      expect(screen.getByText(/waiting for the teacher/i)).toBeInTheDocument();
    });

    it('sees the same cartridge shelf as the Host, but cannot touch it', () => {
      renderLobby('CLIENT', makeRoom({ status: 'CONFIGURING_GAME' }));

      expect(status()).toBe('CONFIGURING_GAME');
      expect(screen.getByText(/choosing the game/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^stop$/i })).toBeDisabled();
    });

    it('shows which cartridge the Host has picked', () => {
      const room = { ...makeRoom({ status: 'CONFIGURING_GAME' }), selectedGameId: 'STOP' as const };
      renderLobby('CLIENT', room);

      expect(screen.getByRole('button', { name: /^stop$/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('keeps the room untouched when a Client clicks the disabled cartridge', async () => {
      const user = userEvent.setup();
      renderLobby('CLIENT', makeRoom({ status: 'CONFIGURING_GAME' }));

      await user.click(screen.getByRole('button', { name: /^stop$/i }));

      expect(status()).toBe('CONFIGURING_GAME');
      expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument();
    });
  });
});
