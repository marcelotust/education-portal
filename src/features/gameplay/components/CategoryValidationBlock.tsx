import type { Player, StopAnswer } from '@/types';
import { cn } from '@/utils/cn';

interface CategoryValidationBlockProps {
  category: string;
  players: readonly Player[];
  answers: readonly StopAnswer[];
  /** What each answer is worth right now; it moves as the Host judges. Hidden until judged. */
  pointsByPlayer: Readonly<Record<string, number>>;
  canJudge: boolean;
  onJudge: (playerId: string, isValid: boolean) => void;
}

/** One category with every player's answer side by side, as the blueprint asks. */
export const CategoryValidationBlock = ({
  category,
  players,
  answers,
  pointsByPlayer,
  canJudge,
  onJudge,
}: CategoryValidationBlockProps) => (
  <div className="flex flex-col gap-2">
    <h2 className="font-arcade text-[10px] tracking-widest text-sky-600">{category}</h2>

    <ul className="flex flex-col gap-1">
      {players.map((player) => {
        const answer = answers.find((entry) => entry.playerId === player.id);
        const value = answer?.value.trim() ?? '';
        const isApproved = answer?.isValid === true;
        const isRejected = answer?.isValid === false;
        const isJudged = isApproved || isRejected;
        const points = pointsByPlayer[player.id] ?? 0;

        return (
          <li
            key={player.id}
            className={cn(
              'flex items-center gap-2 border-2 bg-white px-2 py-2',
              // A pending answer is visibly unfinished business.
              value !== '' && !isJudged ? 'border-dashed border-gray-400' : 'border-ink',
            )}
          >
            <span className="min-w-14 shrink-0 font-arcade text-[9px] text-gray-500">
              {player.nickname}
            </span>

            <span
              className={cn(
                'flex-1 font-terminal text-xl',
                value === '' && 'text-gray-400',
                isRejected ? 'text-gray-400 line-through' : 'text-black',
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
                    points === 0 ? 'text-gray-400' : 'text-green-600',
                  )}
                >
                  {isJudged ? points : ''}
                </span>

                <button
                  type="button"
                  aria-label={`Approve ${value} from ${player.nickname}`}
                  aria-pressed={isApproved}
                  disabled={!canJudge}
                  onClick={() => onJudge(player.id, true)}
                  className={cn(
                    'flex min-h-11 min-w-11 items-center justify-center border-4 border-ink font-arcade text-3xl transition-transform disabled:cursor-not-allowed',
                    isApproved
                      ? 'translate-x-[2px] translate-y-[2px] bg-green-500 text-white shadow-none'
                      : cn(
                          'bg-white text-green-500 shadow-[2px_2px_0px_0px_#381a41]',
                          'disabled:text-gray-300 disabled:shadow-none',
                        ),
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
                    'flex min-h-11 min-w-11 items-center justify-center border-4 border-ink font-arcade text-3xl transition-transform disabled:cursor-not-allowed',
                    isRejected
                      ? 'translate-x-[2px] translate-y-[2px] bg-rose-500 text-white shadow-none'
                      : cn(
                          'bg-white text-rose-500 shadow-[2px_2px_0px_0px_#381a41]',
                          'disabled:text-gray-300 disabled:shadow-none',
                        ),
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
