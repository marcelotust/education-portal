import type { Player, StopAnswer } from '@/types';
import { cn } from '@/utils/cn';

interface CategoryValidationBlockProps {
  category: string;
  players: readonly Player[];
  answers: readonly StopAnswer[];
  canJudge: boolean;
  onJudge: (playerId: string, isValid: boolean) => void;
}

/** One category with every player's answer side by side, as the blueprint asks. */
export const CategoryValidationBlock = ({
  category,
  players,
  answers,
  canJudge,
  onJudge,
}: CategoryValidationBlockProps) => (
  <div className="flex flex-col gap-2">
    <h2 className="font-arcade text-[10px] tracking-widest text-arcade-cyan">{category}</h2>

    <ul className="flex flex-col gap-1">
      {players.map((player) => {
        const answer = answers.find((entry) => entry.playerId === player.id);
        const value = answer?.value.trim() ?? '';
        const isRejected = answer?.isValid === false;

        return (
          <li
            key={player.id}
            className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-900/60 px-3 py-2"
          >
            <span className="font-arcade text-[9px] text-slate-400">{player.nickname}</span>

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
              <button
                type="button"
                aria-label={`Reject ${value} from ${player.nickname}`}
                aria-pressed={isRejected}
                disabled={!canJudge}
                onClick={() => onJudge(player.id, isRejected)}
                className={cn(
                  'rounded border-2 px-2 py-1 font-arcade text-[9px] transition-colors',
                  isRejected
                    ? 'border-arcade-pink text-arcade-pink'
                    : 'border-arcade-green text-arcade-green',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {isRejected ? 'X' : 'OK'}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);
