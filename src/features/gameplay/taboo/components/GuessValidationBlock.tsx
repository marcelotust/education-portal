import type { Player, TabooGuess } from '@/types';
import { cn } from '@/utils/cn';

interface GuessValidationBlockProps {
  /** Every seated player except the clue-giver, who never guesses their own card. */
  guessers: readonly Player[];
  guesses: readonly TabooGuess[];
  /** What each guess is worth right now; it moves as the Host judges. Hidden until judged. */
  pointsByPlayer: Readonly<Record<string, number>>;
  canJudge: boolean;
  onJudge: (playerId: string, isValid: boolean) => void;
}

/** Every guesser's typed value side by side, flat rather than grouped: TABOO has one guess per player per turn, not one per category. */
export const GuessValidationBlock = ({
  guessers,
  guesses,
  pointsByPlayer,
  canJudge,
  onJudge,
}: GuessValidationBlockProps) => (
  <ul className="flex flex-col gap-1">
    {guessers.map((player) => {
      const guess = guesses.find((entry) => entry.playerId === player.id);
      const value = guess?.value.trim() ?? '';
      const isApproved = guess?.isValid === true;
      const isRejected = guess?.isValid === false;
      const isJudged = isApproved || isRejected;
      const points = pointsByPlayer[player.id] ?? 0;

      return (
        <li
          key={player.id}
          className={cn(
            'flex items-center gap-2 border-2 bg-white px-2 py-2',
            // A pending guess is visibly unfinished business.
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
                data-testid="guess-points"
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
);
