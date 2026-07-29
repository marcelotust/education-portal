import { render, screen, act } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makePlayer, makeRoom } from '@/test/factories';
import type { PlayerRole, PlayerSlot, RoomState } from '@/types';
import { HostAwayOverlay } from './HostAwayOverlay';

const HOST_ID = 'host-1';

const host = (): PlayerSlot => makePlayer(0, { id: HOST_ID, nickname: 'HOST', role: 'HOST' });

const roundInFlight = (seated: readonly PlayerSlot[]): RoomState => ({
  ...makeRoom({ playerCount: 0, status: 'PLAYING' }),
  slots: [...seated, ...Array.from({ length: 6 - seated.length }, () => null)],
});

const renderOverlay = (room: RoomState, role: PlayerRole = 'PLAYER'): void => {
  render(
    <RoomProvider initialState={room} role={role}>
      <HostAwayOverlay />
    </RoomProvider>,
  );
};

const notice = () => screen.queryByRole('alert');

const waitOutTheGrace = (): void => {
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
};

describe('Host away notice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('says nothing while the Host is seated', () => {
    renderOverlay(roundInFlight([host(), makePlayer(1)]));
    waitOutTheGrace();

    expect(notice()).not.toBeInTheDocument();
  });

  it('stays quiet through a blip: the seat has to be empty for a while', () => {
    renderOverlay(roundInFlight([makePlayer(1)]));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(notice()).not.toBeInTheDocument();
  });

  it('tells the Players the round is on hold once the Host stays gone', () => {
    renderOverlay(roundInFlight([makePlayer(1)]));
    waitOutTheGrace();

    expect(notice()).toBeInTheDocument();
    expect(screen.getByText(/waiting for the Host/i)).toBeInTheDocument();
  });

  it('clears itself when the Host comes back', () => {
    const Seats = ({ slots }: { slots: readonly PlayerSlot[] }) => {
      const { dispatch } = useRoom();
      useEffect(() => dispatch({ type: 'PLAYERS_SYNCED', slots }), [dispatch, slots]);
      return null;
    };

    const seated = roundInFlight([host(), makePlayer(1)]).slots;
    const { rerender } = render(
      <RoomProvider initialState={roundInFlight([makePlayer(1)])} role="PLAYER">
        <Seats slots={[]} />
        <HostAwayOverlay />
      </RoomProvider>,
    );
    waitOutTheGrace();
    expect(notice()).toBeInTheDocument();

    rerender(
      <RoomProvider initialState={roundInFlight([makePlayer(1)])} role="PLAYER">
        <Seats slots={seated} />
        <HostAwayOverlay />
      </RoomProvider>,
    );

    expect(notice()).not.toBeInTheDocument();
  });

  it('never shows on the Host screen, which is the one that is present', () => {
    renderOverlay(roundInFlight([makePlayer(1)]), 'HOST');
    waitOutTheGrace();

    expect(notice()).not.toBeInTheDocument();
  });

  it('leaves the lobby alone: nothing is in flight there', () => {
    const room = { ...roundInFlight([makePlayer(1)]), status: 'LOBBY_IDLE' as const };
    renderOverlay(room);
    waitOutTheGrace();

    expect(notice()).not.toBeInTheDocument();
  });
});
