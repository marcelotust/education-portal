import type { Player, StopAnswer } from '@/types';
import { cn } from '@/utils/cn';

interface CategoryValidationBlockProps {
  category: string;
  players: readonly Player[];
  /** Running session score, shown so the Host judges with context. */
  scores: Readonly<Record<string, number>>;
  answers: readonly StopAnswer[];
  /** What each answer is worth right now; it moves as the Host judges. */
  pointsByPlayer: Readonly<Record<string, number>>;
  canJudge: boolean;
  onJudge: (playerId: string, isValid: boolean) => void;
}

/** One category with every player's answer side by side, as the blueprint asks. */
export const CategoryValidationBlock = ({
  category,
  players,
  scores,
  answers,
  pointsByPlayer,
  canJudge,
  onJudge,
}: CategoryValidationBlockProps) => (
  <div className="flex flex-col gap-2">
    <h2 className="font-arcade text-[10px] tracking-widest text-arcade-cyan">{category}</h2>

    <ul className="flex flex-col gap-1">
      {players.map((player) => {
        const answer = answers.find((entry) => entry.playerId === player.id);
        const value = answer?.value.trim() ?? '';
        const isApproved = answer?.isValid === true;
        const isRejected = answer?.isValid === false;
        const points = pointsByPlayer[player.id] ?? 0;

        return (
          <li
            key={player.id}
            className={cn(
              'flex items-center gap-2 rounded border bg-slate-900/60 px-2 py-2',
              // A pending answer is visibly unfinished business.
              value !== '' && !isApproved && !isRejected
                ? 'border-dashed border-slate-600'
                : 'border-slate-800',
            )}
          >
            <span className="w-14 shrink-0 font-arcade text-[9px] text-slate-400">
              {player.nickname} · {scores[player.id] ?? 0}
            </span>

            <span
              className={cn(
                'flex-1 font-terminal text-xl',
                value === '' && 'text-slate-600',
                isRejected ? 'text-slate-600 line-through' : 'text-slate-100',
              )}
            >
              {value === '' ? '—' : value}
            </span>

            {value !== '' && (
              <>
                <span
                  data-testid="answer-points"
                  className={cn(
                    'w-6 shrink-0 text-right font-arcade text-[10px]',
                    points === 0 ? 'text-slate-600' : 'text-arcade-green',
                  )}
                >
                  {points}
                </span>

                <button
                  type="button"
                  aria-label={`Approve ${value} from ${player.nickname}`}
                  aria-pressed={isApproved}
                  disabled={!canJudge}
                  onClick={() => onJudge(player.id, true)}
                  className={cn(
                    'rounded border-2 px-2 py-1 font-arcade text-[9px] transition-colors',
                    isApproved
                      ? 'border-arcade-green bg-arcade-green/15 text-arcade-green'
                      : 'border-slate-700 text-slate-500',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  )}
                >
                  ✓
                </button>

                <button
                  type="button"
                  aria-label={`Reject ${value} from ${player.nickname}`}
                  aria-pressed={isRejected}
                  disabled={!canJudge}
                  onClick={() => onJudge(player.id, false)}
                  className={cn(
                    'rounded border-2 px-2 py-1 font-arcade text-[9px] transition-colors',
                    isRejected
                      ? 'border-arcade-pink bg-arcade-pink/15 text-arcade-pink'
                      : 'border-slate-700 text-slate-500',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  )}
                >
                  ✕
                </button>
              </>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);
