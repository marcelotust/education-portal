import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeQuizRound, makeRoom } from '@/test/factories';
import type { QuizAnswer, QuizRound, RoomState } from '@/types';
import { QuizRoundScreen } from './QuizRoundScreen';

const { sendAnswer, useQuizAnswerBroadcastMock } = vi.hoisted(() => ({
  sendAnswer: vi.fn(),
  useQuizAnswerBroadcastMock: vi.fn(),
}));

vi.mock('@/hooks/useQuizAnswerBroadcast', () => ({
  useQuizAnswerBroadcast: useQuizAnswerBroadcastMock,
}));

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
  let receiveAnswer: ((answer: QuizAnswer) => void) | null = null;

  beforeEach(() => {
    sendAnswer.mockClear();
    receiveAnswer = null;
    useQuizAnswerBroadcastMock.mockImplementation(
      ({ onAnswer }: { onAnswer: (answer: QuizAnswer) => void }) => {
        receiveAnswer = onAnswer;
        return { sendAnswer };
      },
    );
  });

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

  it('broadcasts a pick, not just a local click', async () => {
    const user = userEvent.setup();
    renderRound();

    await user.click(screen.getByRole('button', { name: /Mercury/ }));

    expect(sendAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 'player-0', choice: 1 }),
    );
  });

  it('ends the round for everyone once every seated player has answered, not just the Host', async () => {
    const user = userEvent.setup();
    renderRound(playing());

    await user.click(screen.getByRole('button', { name: /Mercury/ }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // The room's other seated player answers on a different tab; this is what
    // arrives back over the broadcast the Host is subscribed to.
    act(() => receiveAnswer?.({ playerId: 'player-1', choice: 0, elapsedMs: 500 }));

    expect(screen.getByRole('alert')).toHaveTextContent(/everyone has answered/i);
  });
});
