import { InlineAdSlot } from '@/components/layout/InlineAdSlot';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { cn } from '@/utils/cn';

const MEDALS = ['1ST', '2ND', '3RD'];

/** Standings after the Host confirmed the scores. */
export const ScoreboardScreen = () => {
  const { state, isHost, dispatch } = useRoom();

  const ranked = state.slots
    .filter((slot): slot is Player => slot !== null)
    .map((player) => ({
      player,
      score: state.scores[player.id] ?? 0,
      gained: state.lastRoundPoints[player.id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <h1 className="text-center font-arcade text-sm text-yellow-500">SCOREBOARD</h1>

      <ol className="flex flex-col gap-2">
        {ranked.map(({ player, score, gained }, position) => (
          <li
            key={player.id}
            data-testid="scoreboard-row"
            className={cn(
              'flex items-center justify-between gap-3 border-2 border-black px-3 py-2',
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

      <InlineAdSlot label="AD SPACE" />

      {isHost && (
        <RetroButton tone="cyan" onClick={() => dispatch({ type: 'RETURN_TO_LOBBY' })}>
          BACK TO LOBBY
        </RetroButton>
      )}
    </RetroContainer>
  );
};
