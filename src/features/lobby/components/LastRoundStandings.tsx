import type { Player } from '@/types';
import { cn } from '@/utils/cn';

interface LastRoundStandingsProps {
  players: readonly Player[];
  scores: Readonly<Record<string, number>>;
  lastRoundPoints: Readonly<Record<string, number>>;
}

/**
 * The scoreboard screen disappears the moment the Host moves on. The standings
 * stay here, with what the last round was worth, so nobody misses the result.
 */
export const LastRoundStandings = ({
  players,
  scores,
  lastRoundPoints,
}: LastRoundStandingsProps) => {
  const ranked = [...players]
    .map((player) => ({
      player,
      score: scores[player.id] ?? 0,
      gained: lastRoundPoints[player.id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-2" data-testid="last-round-standings">
      <p className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">
        Standings · last round
      </p>

      <ol className="flex flex-col gap-1">
        {ranked.map(({ player, score, gained }, position) => (
          <li
            key={player.id}
            className={cn(
              'flex items-center gap-2 border-2 border-ink px-2 py-1',
              position === 0 ? 'bg-yellow-200' : 'bg-white',
            )}
          >
            <span className="w-6 shrink-0 font-arcade text-[9px] text-black">{position + 1}</span>
            <span className="flex-1 font-arcade text-[9px] text-black">{player.nickname}</span>
            <span className="font-arcade text-[9px] text-black">
              {gained > 0 ? `+${gained}` : '—'}
            </span>
            <span className="w-8 shrink-0 text-right font-arcade text-[10px] text-black">
              {score}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};
