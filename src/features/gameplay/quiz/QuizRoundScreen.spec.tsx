import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeQuizRound, makeRoom } from '@/test/factories';
import type { QuizRound, RoomState } from '@/types';
import { QuizRoundScreen } from './QuizRoundScreen';

const playing = (round: Partial<QuizRound> = {}): RoomState => ({
  ...makeRoom({ playerCount: 2, status: 'PLAYING' }),
  currentRound: makeQuizRound({ endsAt: new Date(Date.now() + 30_000).toISOString(), ...round }),
});

/** Test-only control: closes the question and walks the match forward. */
const AdvanceProbe = () => {
  const { dispatch } = useRoom();
  return (
    <button
      type="button"
      onClick={() => {
        dispatch({ type: 'END_ROUND' });
        dispatch({ type: 'NEXT_QUESTION', endsAt: new Date(Date.now() + 30_000).toISOString() });
      }}
    >
      ADVANCE
    </button>
  );
};

const renderRound = (room: RoomState = playing()) =>
  render(
    <RoomProvider initialState={room} role="HOST">
      <QuizRoundScreen playerId="player-0" />
      <AdvanceProbe />
    </RoomProvider>,
  );

const options = () => within(screen.getByRole('list')).getAllByRole('button');

describe('QUIZ round screen', () => {
  it('asks the question the match is currently on', () => {
    renderRound(playing({ currentIndex: 1 }));

    expect(screen.getByRole('heading', { name: /largest ocean/i })).toBeInTheDocument();
    expect(screen.getByTestId('question-progress')).toHaveTextContent('2/3');
  });

  it('starts the next question with nothing selected', async () => {
    const user = userEvent.setup();
    renderRound();

    await user.click(screen.getByRole('button', { name: /Mercury/ }));
    expect(screen.getByRole('button', { name: /Mercury/ })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'ADVANCE' }));

    expect(screen.getByTestId('question-progress')).toHaveTextContent('2/3');
    for (const option of options()) {
      expect(option).toHaveAttribute('aria-pressed', 'false');
      expect(option).toBeEnabled();
    }
  });
});
