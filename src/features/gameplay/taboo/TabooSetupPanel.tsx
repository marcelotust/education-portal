import { TABOO_ROUND_DURATIONS, type RoundDuration, type TabooSetup } from '@/types';
import { cn } from '@/utils/cn';
import { TABOO_CATEGORY_CATALOG } from './tabooRound';

interface TabooSetupPanelProps {
  setup: TabooSetup;
  /** Omitted for Players: they watch the Host configure the match. */
  onSelectDuration?: ((seconds: RoundDuration) => void) | undefined;
  onToggleCategory?: ((category: string) => void) | undefined;
}

export const TabooSetupPanel = ({
  setup,
  onSelectDuration,
  onToggleCategory,
}: TabooSetupPanelProps) => {
  const isReadOnly = onSelectDuration === undefined;
  const chosen = setup.categories.length;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-slate-800 p-3">
      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
          Turn length
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TABOO_ROUND_DURATIONS.map((seconds) => (
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
          {TABOO_CATEGORY_CATALOG.map((category) => {
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

        {chosen === 0 && (
          <p role="status" className="font-terminal text-sm text-arcade-pink">
            Pick at least 1 to start.
          </p>
        )}
      </div>
    </div>
  );
};
