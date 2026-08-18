import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeRoom } from '@/test/factories';
import { RoomJoinError } from '@/types/roomService';
import type { RoomSession } from '@/types/roomService';
import { JoinRoomScreen } from './JoinRoomScreen';

const session = (): RoomSession => ({
  room: makeRoom({ playerCount: 2 }),
  playerId: 'player-1',
  role: 'PLAYER',
  nickname: 'ANA',
  joinedAt: '2026-07-24T12:06:00.000Z',
});

/** Types one PIN letter per box, matching how a Player actually fills it in. */
const typePin = async (user: UserEvent, pin: string) => {
  for (let index = 0; index < pin.length; index += 1) {
    const letter = pin[index];
    if (letter === undefined) continue;
    await user.type(screen.getByLabelText(new RegExp(`room pin letter ${index + 1}`, 'i')), letter);
  }
};

describe('Join room screen', () => {
  it('joins with the PIN and nickname the Player typed', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockResolvedValue(session());
    const onReady = vi.fn();
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={onReady} />);

    // The PIN is stored uppercase, so typing it in lowercase must still work.
    await typePin(user, 'kpzt');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(joinRoom).toHaveBeenCalledWith('KPZT', 'ANA');
    await waitFor(() =>
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ role: 'PLAYER' })),
    );
  });

  it('keeps JOIN disabled until both the PIN and a nickname are filled in', async () => {
    const user = userEvent.setup();
    render(<JoinRoomScreen joinRoom={vi.fn()} onReady={vi.fn()} />);

    const joinButton = screen.getByRole('button', { name: /join/i });
    expect(joinButton).toBeDisabled();

    await typePin(user, 'KPZT');
    expect(joinButton).toBeDisabled();

    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    expect(joinButton).toBeEnabled();
  });

  it('keeps JOIN disabled while the PIN is not yet 4 letters', async () => {
    const user = userEvent.setup();
    render(<JoinRoomScreen joinRoom={vi.fn()} onReady={vi.fn()} />);

    await typePin(user, 'AB');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');

    expect(screen.getByRole('button', { name: /join/i })).toBeDisabled();
  });

  it('tells the Player when the room does not exist', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_NOT_FOUND'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} />);

    await typePin(user, 'ZZZZ');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no room with that pin/i);
  });

  it('does not blame the Player when a suggested room has ended', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_NOT_FOUND'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} initialPin="KPZT" />);

    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/that room has ended/i);
  });

  it('still says the PIN is unknown when the Player typed it themselves', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_NOT_FOUND'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} initialPin="KPZT" />);

    // Typing over the prefilled PIN replaces it, box by box.
    await typePin(user, 'ZZZZ');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no room with that pin/i);
  });

  it('tells the Player when all 6 seats are taken', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_FULL'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} />);

    await typePin(user, 'KPZT');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/room is full/i);
  });
});
