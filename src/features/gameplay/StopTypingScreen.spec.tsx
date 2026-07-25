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

  it('sends every category, uppercased, when the player hits STOP', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StopTypingScreen round={round()} onSubmit={onSubmit} secondsLeft={45} />);

    await user.type(screen.getByLabelText('ANIMAL'), 'bear');
    await user.type(screen.getByLabelText('FOOD'), 'bread');
    await user.click(screen.getByRole('button', { name: /stop/i }));

    expect(onSubmit).toHaveBeenCalledWith([
      { category: 'ANIMAL', value: 'BEAR' },
      { category: 'FOOD', value: 'BREAD' },
      { category: 'COUNTRY', value: '' },
    ]);
  });

  it('locks the fields once the player has submitted', async () => {
    const user = userEvent.setup();
    render(<StopTypingScreen round={round()} onSubmit={vi.fn()} secondsLeft={45} />);

    await user.click(screen.getByRole('button', { name: /stop/i }));

    expect(screen.getByLabelText('ANIMAL')).toBeDisabled();
    expect(screen.getByText(/answers sent/i)).toBeInTheDocument();
  });

  it('does not submit twice when the player clicks STOP again', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StopTypingScreen round={round()} onSubmit={onSubmit} secondsLeft={45} />);

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

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('ANIMAL')).toBeDisabled();
  });
});
