import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomProvider } from '@/hooks/RoomProvider';
import { roomReducer } from '@/hooks/roomMachine';
import { makeBotPlayer, makeRoom, makeRound, makeTabooRound } from '@/test/factories';
import type { RoomState } from '@/types';
import { AdBreakScreen } from './AdBreakScreen';
import { RoundValidationScreen } from './RoundValidationScreen';
import type * as TabooRoundModule from './taboo/tabooRound';
import { createTabooRound, DEFAULT_TABOO_SETUP } from './taboo/tabooRound';

vi.mock('./taboo/tabooRound', async (importOriginal) => ({
  ...(await importOriginal<typeof TabooRoundModule>()),
  createTabooRound: vi.fn(),
}));

/**
 * The bot (#155) only plays QUIZ. STOP and TABOO read the real seats, so it
 * sits out of them; nothing says so in their own code, so these specs do.
 */
describe('cartridges that do not play the bot', () => {
  const stopJudged = (): RoomState => ({
    ...makeRoom({ playerCount: 2, status: 'CALCULATING_SCORES', bot: makeBotPlayer() }),
    currentRound: makeRound({
      phase: 'VALIDATION_PHASE',
      categories: ['ANIMAL'],
      answers: [
        { playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: true },
        { playerId: 'player-1', category: 'ANIMAL', value: 'BIRD', isValid: true },
      ],
    }),
  });

  it('leaves the bot out of the STOP scores', () => {
    const scored = roomReducer(stopJudged(), { type: 'ROUND_SCORED' });

    expect(scored.scores).toEqual({ 'player-0': 10, 'player-1': 10 });
    expect(scored.lastRoundPoints).not.toHaveProperty('bot:1');
  });

  it('does not ask the Host to judge a seat that never typed anything', () => {
    render(
      <RoomProvider initialState={stopJudged()} role="HOST">
        <RoundValidationScreen />
      </RoomProvider>,
    );

    expect(screen.getByText('BEAR')).toBeInTheDocument();
    expect(screen.queryByText('BOT')).not.toBeInTheDocument();
  });

  describe('drawing TABOO', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.mocked(createTabooRound).mockResolvedValue(makeTabooRound());
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.clearAllMocks();
    });

    it('never hands the bot a turn as clue-giver or guesser', async () => {
      const room: RoomState = {
        ...makeRoom({ playerCount: 2, status: 'PLAYING_AD', bot: makeBotPlayer() }),
        selectedGameId: 'TABOO',
        gameSetup: { game: 'TABOO', ...DEFAULT_TABOO_SETUP },
      };
      render(
        <RoomProvider initialState={room} role="HOST">
          <AdBreakScreen />
        </RoomProvider>,
      );

      for (let second = 0; second < 8; second += 1) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
      }

      expect(createTabooRound).toHaveBeenCalledTimes(1);
      expect(vi.mocked(createTabooRound).mock.calls[0]?.[1]).toEqual(['player-0', 'player-1']);
    });
  });
});
