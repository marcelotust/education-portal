import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeRound } from '@/test/factories';
import type { StopRound } from '@/types';
import { StopTypingScreen } from './StopTypingScreen';

const round = (over: Partial<StopRound> = {}): StopRound =>
  makeRound({ categories: ['ANIMAL', 'FOOD', 'COUNTRY'], ...over });

describe('STOP typing phase', () => {
  it('shows the drawn letter and one field per category', () => {
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    expect(screen.getByTestId('round-letter')).toHaveTextContent('B');
    expect(screen.getByLabelText('ANIMAL')).toBeInTheDocument();
    expect(screen.getByLabelText('FOOD')).toBeInTheDocument();
    expect(screen.getByLabelText('COUNTRY')).toBeInTheDocument();
  });

  it('shows how many seconds are left', () => {
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    expect(screen.getByTestId('round-timer')).toHaveTextContent('45');
  });

  it('keeps STOP out of reach until every category has something in it', async () => {
    const user = userEvent.setup();
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    expect(screen.getByRole('button', { name: /stop/i })).toBeDisabled();

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');
    await user.type(screen.getByLabelText('FOOD'), 'bread');
    expect(screen.getByRole('button', { name: /stop/i })).toBeDisabled();

    await user.type(screen.getByLabelText('COUNTRY'), 'brazil');
    expect(screen.getByRole('button', { name: /stop/i })).toBeEnabled();
  });

  it('does not count whitespace as an answer', async () => {
    const user = userEvent.setup();
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');
    await user.type(screen.getByLabelText('FOOD'), 'bread');
    await user.type(screen.getByLabelText('COUNTRY'), '   ');

    expect(screen.getByRole('button', { name: /stop/i })).toBeDisabled();
  });

  it('tells the player how many fields are still empty', async () => {
    const user = userEvent.setup();
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    expect(screen.getByRole('status')).toHaveTextContent(/3 to go/i);

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');

    expect(screen.getByRole('status')).toHaveTextContent(/2 to go/i);
  });

  it('sends every category, uppercased, when the player hits STOP', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StopTypingScreen round={round()} onSubmit={onSubmit} secondsLeft={45} />);

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');
    await user.type(screen.getByLabelText('FOOD'), 'bread');
    await user.type(screen.getByLabelText('COUNTRY'), 'brazil');
    await user.click(screen.getByRole('button', { name: /stop/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      [
        { category: 'ANIMAL', value: 'BEAR' },
        { category: 'FOOD', value: 'BREAD' },
        { category: 'COUNTRY', value: 'BRAZIL' },
      ],
      true,
    );
  });

  it('locks the fields once the player has submitted', async () => {
    const user = userEvent.setup();
    render(
      <StopTypingScreen
        round={round({ categories: ['ANIMAL'] })}
        onSubmit={vi.fn()}
        secondsLeft={45}
      />,
    );

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');
    await user.click(screen.getByRole('button', { name: /stop/i }));

    expect(screen.getByLabelText('ANIMAL')).toBeDisabled();
    expect(screen.getByText(/answers sent/i)).toBeInTheDocument();
  });

  it('does not submit twice when the player clicks STOP again', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <StopTypingScreen
        round={round({ categories: ['ANIMAL'] })}
        onSubmit={onSubmit}
        secondsLeft={45}
      />,
    );

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');
    await user.click(screen.getByRole('button', { name: /stop/i }));
    await user.click(screen.getByRole('button', { name: /answers sent/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits on its own and locks the fields when time runs out', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <StopTypingScreen round={round()} onSubmit={onSubmit} secondsLeft={1} />,
    );

    rerender(<StopTypingScreen round={round()} onSubmit={onSubmit} secondsLeft={0} />);

    // Running out of time is not calling STOP.
    expect(onSubmit).toHaveBeenCalledWith(expect.anything(), false);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('ANIMAL')).toBeDisabled();
  });
});

describe('the closing seconds', () => {
  it('stays calm while there is plenty of time', () => {
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    expect(screen.getByTestId('round-timer')).toHaveAttribute('data-urgency', 'calm');
  });

  it('warns from ten seconds out', () => {
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={10} />);

    expect(screen.getByTestId('round-timer')).toHaveAttribute('data-urgency', 'warning');
  });

  it('turns critical for the last five', () => {
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={5} />);

    expect(screen.getByTestId('round-timer')).toHaveAttribute('data-urgency', 'critical');
  });

  it('announces who called STOP, so nobody wonders why the clock jumped', () => {
    render(
      <StopTypingScreen
        round={round({ stoppedBy: 'player-1' })}
        stoppedByNickname="ANA"
        onSubmit={vi.fn()}
        secondsLeft={5}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/ANA called STOP/i);
  });

  it('says nothing while the round is running normally', () => {
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={20} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
