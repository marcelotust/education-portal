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
  nickname: 'HOST',
  joinedAt: '2026-07-24T12:00:00.000Z',
});

describe('Host entry screen', () => {
  describe('resuming a room the Host already owns', () => {
    it('offers the open room instead of silently abandoning it', () => {
      const resumable = { ...session(), room: { ...makeRoom({ playerCount: 3 }), pin: 'KPZT' } };
      render(
        <HostEntryScreen
          createRoom={vi.fn()}
          onReady={vi.fn()}
          resumableRoom={resumable}
          onResume={vi.fn()}
        />,
      );

      expect(screen.getByText('KPZT')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resume room/i })).toBeInTheDocument();
    });

    it('hands the existing session back when the Host resumes', async () => {
      const user = userEvent.setup();
      const resumable = session();
      const onResume = vi.fn();
      render(
        <HostEntryScreen
          createRoom={vi.fn()}
          onReady={vi.fn()}
          resumableRoom={resumable}
          onResume={onResume}
        />,
      );

      await user.click(screen.getByRole('button', { name: /resume room/i }));

      expect(onResume).toHaveBeenCalledWith(resumable);
    });

    it('still lets the Host start a fresh room instead', async () => {
      const user = userEvent.setup();
      const createRoom = vi.fn().mockResolvedValue(session());
      render(
        <HostEntryScreen
          createRoom={createRoom}
          onReady={vi.fn()}
          resumableRoom={session()}
          onResume={vi.fn()}
        />,
      );

      await user.type(screen.getByLabelText(/nickname/i), 'HOST');
      await user.click(screen.getByRole('button', { name: /create room/i }));

      expect(createRoom).toHaveBeenCalledWith('HOST');
    });

    it('shows no resume offer when there is no open room', () => {
      render(<HostEntryScreen createRoom={vi.fn()} onReady={vi.fn()} />);

      expect(screen.queryByRole('button', { name: /resume room/i })).not.toBeInTheDocument();
    });
  });

  it('creates a room with the nickname the Host typed', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn().mockResolvedValue(session());
    const onReady = vi.fn();
    render(<HostEntryScreen createRoom={createRoom} onReady={onReady} />);

    await user.type(screen.getByLabelText(/nickname/i), 'HOST');
    await user.click(screen.getByRole('button', { name: /create room/i }));

    expect(createRoom).toHaveBeenCalledWith('HOST');
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

  it('surfaces a backend failure instead of leaving the Host waiting', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn().mockRejectedValue(new Error('network down'));
    render(<HostEntryScreen createRoom={createRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/nickname/i), 'HOST');
    await user.click(screen.getByRole('button', { name: /create room/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not create/i);
  });

  it('blocks a second submit while the room is being created', async () => {
    const user = userEvent.setup();
    const createRoom = vi.fn().mockReturnValue(new Promise(() => undefined));
    render(<HostEntryScreen createRoom={createRoom} onReady={vi.fn()} />);

    await user.type(screen.getByLabelText(/nickname/i), 'HOST');
    await user.click(screen.getByRole('button', { name: /create room/i }));
    await user.click(screen.getByRole('button', { name: /creating/i }));

    expect(createRoom).toHaveBeenCalledTimes(1);
  });
});
