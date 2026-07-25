import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeRoom } from '@/test/factories';
import type { RoomSession } from '@/types/roomService';
import { HostEntryScreen } from './HostEntryScreen';

const session = (): RoomSession => ({
  room: makeRoom({ playerCount: 1 }),
  playerId: 'player-0',
  role: 'HOST',
  nickname: 'TEACHER',
  joinedAt: '2026-07-24T12:00:00.000Z',
});

describe('Host entry screen', () => {
  it('creates a room with the nickname the teacher typed', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn().mockResolvedValue(session());
    const onReady = vi.fn();
    render(<HostEntryScreen createRoom={createRoom} onReady={onReady} />);

    await user.type(screen.getByLabelText(/nickname/i), 'TEACHER');
    await user.click(screen.getByRole('button', { name: /create room/i }));

    expect(createRoom).toHaveBeenCalledWith('TEACHER');
    await waitFor(() =>
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ role: 'HOST' })),
    );
  });

  it('refuses to create a room without a nickname, since the Host takes seat 1', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn();
    render(<HostEntryScreen createRoom={createRoom} onReady={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /create room/i }));

    expect(createRoom).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/nickname/i);
  });

  it('surfaces a backend failure instead of leaving the teacher waiting', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn().mockRejectedValue(new Error('network down'));
    render(<HostEntryScreen createRoom={createRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/nickname/i), 'TEACHER');
    await user.click(screen.getByRole('button', { name: /create room/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not create/i);
  });

  it('blocks a second submit while the room is being created', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn().mockReturnValue(new Promise(() => undefined));
    render(<HostEntryScreen createRoom={createRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/nickname/i), 'TEACHER');
    await user.click(screen.getByRole('button', { name: /create room/i }));
    await user.click(screen.getByRole('button', { name: /creating/i }));

    expect(createRoom).toHaveBeenCalledTimes(1);
  });
});
