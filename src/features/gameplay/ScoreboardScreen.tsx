import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { InlineAdSlot } from '@/components/layout/InlineAdSlot';
import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { isAlone } from '@/features/lobby/canStart';
import { useRoom } from '@/hooks/useRoom';
import { trackGameCompleted } from '@/lib/analytics';
import type { Player } from '@/types';
import { cn } from '@/utils/cn';

const MEDALS = ['1ST', '2ND', '3RD'];

/** Standings after the Host confirmed the scores. */
export const ScoreboardScreen = () => {
  const { state, isHost, dispatch } = useRoom();

  // Every participant's browser mounts this screen once the FSM state syncs,
  // so only the Host fires the event — otherwise one finished game would
  // count once per person in the room instead of once per game.
  useEffect(() => {
    if (isHost) trackGameCompleted(isAlone(state.slots), state.bot !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount, not on every isHost re-render.
  }, []);

  // The bot only ranks once it has played: in STOP and TABOO it sits out.
  const bot = state.bot !== null && state.scores[state.bot.id] !== undefined ? [state.bot] : [];
  const ranked = [...state.slots.filter((slot): slot is Player => slot !== null), ...bot]
    .map((player) => ({
      player,
      score: state.scores[player.id] ?? 0,
      gained: state.lastRoundPoints[player.id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <PageTitle tone="yellow">SCOREBOARD</PageTitle>

      <ol className="flex flex-col gap-2">
        {ranked.map(({ player, score, gained }, position) => (
          <li
            key={player.id}
            data-testid="scoreboard-row"
            className={cn(
              'flex items-center justify-between gap-3 border-2 border-ink px-3 py-2',
              position === 0 ? 'bg-yellow-200' : 'bg-white',
            )}
          >
            <span className="font-arcade text-[9px] text-gray-500">
              {MEDALS[position] ?? `${position + 1}TH`}
            </span>
            <span className="flex-1 font-arcade text-[10px] text-black">{player.nickname}</span>
            <span data-testid="round-gain" className="font-arcade text-[9px] text-sky-600">
              {gained > 0 ? `+${gained}` : '—'}
            </span>
            <span className="font-arcade text-sm text-green-600">{score}</span>
          </li>
        ))}
      </ol>

      {isHost && isAlone(state.slots) && (
        <p className="text-center font-terminal text-base text-gray-600">
          STOP is better with more people. Share the invite link and PIN to invite more players.
        </p>
      )}

      <InlineAdSlot label="AD SPACE" />

      {isHost && (
        <RetroButton tone="cyan" onClick={() => dispatch({ type: 'RETURN_TO_LOBBY' })}>
          BACK TO LOBBY
        </RetroButton>
      )}

      <Link
        to="/contact"
        className="text-center font-terminal text-sm text-gray-500 underline hover:text-gray-700"
      >
        Got a suggestion or found a bug?
      </Link>
    </RetroContainer>
  );
};
