import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { makeRoom } from '@/test/factories';
import { RoomProvider } from './RoomProvider';
import { useRoom } from './useRoom';
import type { PlayerRole } from '@/types';

/** Test-only harness: fires a Host-only event from whatever role is mounted. */
const StartGameProbe = () => {
  const { state, dispatch } = useRoom();
  return (
    <button type="button" onClick={() => dispatch({ type: 'OPEN_GAME_CONFIG' })}>
      {state.status}
    </button>
  );
};

const renderProbe = (role: PlayerRole) =>
  render(
    <RoomProvider initialState={makeRoom()} role={role}>
      <StartGameProbe />
    </RoomProvider>,
  );

describe('RoomProvider write permissions', () => {
  it('applies flow-control events dispatched by the Host', async () => {
    const user = userEvent.setup();
    renderProbe('HOST');

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('CONFIGURING_GAME');
  });

  it('drops flow-control events dispatched by a Client', async () => {
    const user = userEvent.setup();
    renderProbe('CLIENT');

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('LOBBY_IDLE');
  });
});
