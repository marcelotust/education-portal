import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { cn } from '@/utils/cn';

const MEDALS = ['1ST', '2ND', '3RD'];

/** Standings after the Host confirmed the scores. */
export const ScoreboardScreen = () => {
  const { state, isHost, dispatch } = useRoom();

  const ranked = state.slots
    .filter((slot): slot is Player => slot !== null)
    .map((player) => ({ player, score: state.scores[player.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-neon text-center font-arcade text-sm text-arcade-yellow">SCOREBOARD</h1>

      <ol className="flex flex-col gap-2">
        {ranked.map(({ player, score }, position) => (
          <li
            key={player.id}
            data-testid="scoreboard-row"
            className={cn(
              'flex items-center justify-between gap-3 rounded border-2 px-3 py-2',
              position === 0 ? 'border-arcade-yellow bg-arcade-yellow/10' : 'border-slate-800',
            )}
          >
            <span className="font-arcade text-[9px] text-slate-500">
              {MEDALS[position] ?? `${position + 1}TH`}
            </span>
            <span className="flex-1 font-arcade text-[10px] text-slate-100">{player.nickname}</span>
            <span className="font-arcade text-sm text-arcade-green">{score}</span>
          </li>
        ))}
      </ol>

      {isHost && (
        <ArcadeButton tone="cyan" onClick={() => dispatch({ type: 'RETURN_TO_LOBBY' })}>
          BACK TO LOBBY
        </ArcadeButton>
      )}
    </section>
  );
};
