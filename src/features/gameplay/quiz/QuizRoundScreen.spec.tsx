import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { useRoom } from '@/hooks/useRoom';
import { makeQuizRound, makeRoom } from '@/test/factories';
import type { PlayerRole, QuizAnswer, QuizRound, RoomState } from '@/types';
import { QuizRoundScreen } from './QuizRoundScreen';

const { sendAnswer, sendDeadline, useQuizAnswerBroadcastMock } = vi.hoisted(() => ({
  sendAnswer: vi.fn(),
  sendDeadline: vi.fn(),
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

const renderRound = (room: RoomState = playing(), role: PlayerRole = 'HOST') =>
  render(
    <RoomProvider initialState={room} role={role}>
      <QuizRoundScreen playerId="player-0" />
      <AdvanceProbe />
    </RoomProvider>,
  );

const options = () => within(screen.getByRole('list')).getAllByRole('button');

describe('QUIZ round screen', () => {
  let receiveAnswer: ((answer: QuizAnswer) => void) | null = null;
  let receiveDeadline: ((endsAt: string) => void) | null = null;

  beforeEach(() => {
    sendAnswer.mockClear();
    sendDeadline.mockClear();
    receiveAnswer = null;
    receiveDeadline = null;
    useQuizAnswerBroadcastMock.mockImplementation(
      ({
        onAnswer,
        onDeadline,
      }: {
        onAnswer: (answer: QuizAnswer) => void;
        onDeadline: (endsAt: string) => void;
      }) => {
        receiveAnswer = onAnswer;
        receiveDeadline = onDeadline;
        return { sendAnswer, sendDeadline };
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

  it('broadcasts the shortened deadline the instant everyone answers, not just persisting it (#105)', async () => {
    const user = userEvent.setup();
    renderRound(playing());

    await user.click(screen.getByRole('button', { name: /Mercury/ }));
    expect(sendDeadline).not.toHaveBeenCalled();

    act(() => receiveAnswer?.({ playerId: 'player-1', choice: 0, elapsedMs: 500 }));

    expect(sendDeadline).toHaveBeenCalledWith(expect.any(String));
  });

  it("shortens a Player's own countdown immediately once the deadline broadcast lands, without waiting on the table round trip (#105)", () => {
    renderRound(playing({ endsAt: new Date(Date.now() + 30_000).toISOString() }), 'PLAYER');
    const secondsBefore = Number(screen.getByTestId('round-timer').textContent);

    act(() => receiveDeadline?.(new Date(Date.now() + 3000).toISOString()));

    const secondsAfter = Number(screen.getByTestId('round-timer').textContent);
    expect(secondsAfter).toBeLessThan(secondsBefore);
    expect(secondsAfter).toBeLessThanOrEqual(3);
  });
});
