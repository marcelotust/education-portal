import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom } from '@/test/factories';
import type { PlayerRole, RoomState } from '@/types';
import { AdBreakScreen } from './AdBreakScreen';

const StatusProbe = () => {
  const { state } = useRoom();
  return <span data-testid="room-status">{state.status}</span>;
};

const renderBreak = (
  role: PlayerRole = 'HOST',
  room: RoomState = makeRoom({ status: 'PLAYING_AD' }),
) =>
  render(
    <RoomProvider initialState={room} role={role}>
      <StatusProbe />
      <AdBreakScreen />
    </RoomProvider>,
  );

const status = () => screen.getByTestId('room-status').textContent;

describe('Ad break', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('gives a phone somewhere to put an ad, since the lateral AdSlot is desktop-only', () => {
    vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'pub-test-123');
    renderBreak();

    expect(screen.getByTestId('inline-ad-slot')).toHaveTextContent('AD SPACE');
  });

  it('counts down from 8, long enough for a slot to render before GO!', () => {
    renderBreak();

    expect(screen.getByTestId('ad-countdown')).toHaveTextContent('8');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('ad-countdown')).toHaveTextContent('7');
  });

  const runOutTheClock = (): void => {
    for (let second = 0; second < 8; second += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
  };

  it('shows GO! and starts the round once the countdown reaches zero', () => {
    renderBreak();

    runOutTheClock();

    expect(screen.getByTestId('ad-countdown')).toHaveTextContent('GO!');
    expect(status()).toBe('PLAYING');
  });

  it('waits for the Host to draw the round: a Player just watches the countdown', () => {
    renderBreak('PLAYER');

    runOutTheClock();

    expect(status()).toBe('PLAYING_AD');
  });
});
