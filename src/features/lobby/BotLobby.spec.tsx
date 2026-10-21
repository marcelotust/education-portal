import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import * as analytics from '@/lib/analytics';
import { makeBotPlayer, makeRoom } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { LobbyScreen } from './LobbyScreen';

vi.mock('@/lib/analytics', () => ({ trackGameStarted: vi.fn(), trackBotAdded: vi.fn() }));

const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

const renderLobby = (role: PlayerRole, room: RoomState): void => {
  render(
    <MemoryRouter>
      <RoomProvider initialState={room} role={role}>
        <StatusProbe />
        <LobbyScreen />
      </RoomProvider>
    </MemoryRouter>,
  );
};

const soloHost = (overrides: Partial<RoomState> = {}): RoomState => {
  const room = makeRoom({ playerCount: 1, status: 'CONFIGURING_GAME' });
  return {
    ...room,
    slots: room.slots.map((slot) => (slot ? { ...slot, role: 'HOST' } : slot)),
    ...overrides,
  };
};

const startButton = () => screen.getByRole('button', { name: /start game/i });

describe('bot in the lobby (#155)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lets the Host add a bot, which takes the next seat and is labeled as one', async () => {
    const user = userEvent.setup();
    renderLobby('HOST', soloHost());

    await user.click(screen.getByRole('button', { name: /add bot/i }));

    expect(within(screen.getByTestId('player-slot-1')).getByText('BOT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove bot/i })).toBeInTheDocument();
    expect(analytics.trackBotAdded).toHaveBeenCalledTimes(1);
  });

  it('lets the Host take the bot away again', async () => {
    const user = userEvent.setup();
    renderLobby('HOST', soloHost({ bot: makeBotPlayer() }));

    await user.click(screen.getByRole('button', { name: /remove bot/i }));

    expect(screen.queryByText('BOT')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add bot/i })).toBeInTheDocument();
  });

  it('offers a bot to a Host who is alone, in the same place as the waiting hint', async () => {
    const user = userEvent.setup();
    renderLobby('HOST', soloHost());

    await user.click(screen.getByRole('button', { name: /^quiz$/i }));

    expect(startButton()).toBeDisabled();
    expect(screen.getByText(/quiz needs a real player or a bot/i)).toBeInTheDocument();
  });

  it('starts QUIZ against the bot alone and tags the match as solo with a bot', async () => {
    const user = userEvent.setup();
    renderLobby('HOST', soloHost({ bot: makeBotPlayer() }));

    await user.click(screen.getByRole('button', { name: /^quiz$/i }));
    expect(startButton()).toBeEnabled();

    await user.click(startButton());

    expect(screen.getByTestId('room-status')).toHaveTextContent('PLAYING_AD');
    expect(analytics.trackGameStarted).toHaveBeenCalledWith('QUIZ', true, true);
  });

  it('keeps TABOO waiting for a real Player even with the bot seated', async () => {
    const user = userEvent.setup();
    renderLobby('HOST', soloHost({ bot: makeBotPlayer() }));

    await user.click(screen.getByRole('button', { name: /^taboo$/i }));

    expect(startButton()).toBeDisabled();
    expect(screen.getByText(/taboo needs at least one real player/i)).toBeInTheDocument();
  });

  it('follows the bot being removed after QUIZ was already picked', async () => {
    const user = userEvent.setup();
    renderLobby('HOST', soloHost({ bot: makeBotPlayer() }));

    await user.click(screen.getByRole('button', { name: /^quiz$/i }));
    expect(startButton()).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /remove bot/i }));
    expect(startButton()).toBeDisabled();
  });

  it('does not offer a bot when six real people hold every seat', () => {
    renderLobby('HOST', { ...makeRoom({ playerCount: 6, status: 'CONFIGURING_GAME' }) });

    expect(screen.queryByRole('button', { name: /add bot/i })).not.toBeInTheDocument();
  });

  it('lets a Player see the bot on the board but never add or remove it', () => {
    renderLobby(
      'PLAYER',
      makeRoom({ playerCount: 2, status: 'CONFIGURING_GAME', bot: makeBotPlayer() }),
    );

    expect(screen.getByText('BOT')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add bot/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove bot/i })).not.toBeInTheDocument();
  });
});
