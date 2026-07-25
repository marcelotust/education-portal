import { MIN_CATEGORIES, ROUND_DURATIONS, type RoundDuration, type StopSetup } from '@/types';
import { cn } from '@/utils/cn';
import { STOP_CATEGORY_CATALOG } from './stopRound';

interface StopSetupPanelProps {
  setup: StopSetup;
  /** Omitted for Clients: they watch the Host configure the match. */
  onSelectDuration?: ((seconds: RoundDuration) => void) | undefined;
  onToggleCategory?: ((category: string) => void) | undefined;
}

export const StopSetupPanel = ({
  setup,
  onSelectDuration,
  onToggleCategory,
}: StopSetupPanelProps) => {
  const isReadOnly = onSelectDuration === undefined;
  const chosen = setup.categories.length;
  const missing = MIN_CATEGORIES - chosen;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-slate-800 p-3">
      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
          Round length
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ROUND_DURATIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              aria-label={`${seconds} seconds`}
              aria-pressed={setup.roundDurationSeconds === seconds}
              disabled={isReadOnly}
              onClick={() => onSelectDuration?.(seconds)}
              className={cn(
                'min-h-11 rounded border-2 py-2 font-arcade text-[10px] transition-colors',
                setup.roundDurationSeconds === seconds
                  ? 'border-arcade-cyan text-arcade-cyan disabled:border-arcade-cyan disabled:text-arcade-cyan'
                  : 'border-slate-700 text-slate-500',
                'disabled:cursor-not-allowed',
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
          Categories ({chosen})
        </p>

        <div className="flex flex-wrap gap-2">
          {STOP_CATEGORY_CATALOG.map((category) => {
            const isChosen = setup.categories.includes(category);

            return (
              <button
                key={category}
                type="button"
                aria-label={category}
                aria-pressed={isChosen}
                disabled={isReadOnly}
                onClick={() => onToggleCategory?.(category)}
                className={cn(
                  'min-h-11 rounded border-2 px-3 py-2 font-arcade text-[9px] transition-colors',
                  isChosen
                    ? 'border-arcade-green text-arcade-green disabled:border-arcade-green disabled:text-arcade-green'
                    : 'border-slate-800 text-slate-600',
                  'disabled:cursor-not-allowed',
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {missing > 0 && (
          <p role="status" className="font-terminal text-sm text-arcade-pink">
            Pick {missing} more to start ({MIN_CATEGORIES} minimum).
          </p>
        )}
      </div>
    </div>
  );
};
