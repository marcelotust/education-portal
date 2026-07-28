import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Join room screen', () => {
  it('joins with the PIN and nickname the student typed', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockResolvedValue(session());
    const onReady = vi.fn();
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={onReady} />);

    await user.type(screen.getByLabelText(/room pin/i), 'kpzt');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    // The PIN is stored uppercase, so typing it in lowercase must still work.
    expect(joinRoom).toHaveBeenCalledWith('KPZT', 'ANA');
    await waitFor(() =>
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ role: 'PLAYER' })),
    );
  });

  it('rejects a PIN that is not 4 letters before hitting the backend', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn();
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/room pin/i), 'AB');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(joinRoom).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/4 letters/i);
  });

  it('tells the student when the room does not exist', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_NOT_FOUND'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/room pin/i), 'ZZZZ');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no room with that pin/i);
  });

  it('does not blame the student when a suggested room has ended', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_NOT_FOUND'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} initialPin="KPZT" />);

    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/that room has ended/i);
  });

  it('still says the PIN is unknown when the student typed it themselves', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_NOT_FOUND'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} initialPin="KPZT" />);

    await user.clear(screen.getByLabelText(/room pin/i));
    await user.type(screen.getByLabelText(/room pin/i), 'ZZZZ');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no room with that pin/i);
  });

  it('tells the student when all 6 seats are taken', async () => {
    const user = userEvent.setup();
    const joinRoom = vi.fn().mockRejectedValue(new RoomJoinError('ROOM_FULL'));
    render(<JoinRoomScreen joinRoom={joinRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/room pin/i), 'KPZT');
    await user.type(screen.getByLabelText(/nickname/i), 'ANA');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/room is full/i);
  });
});
