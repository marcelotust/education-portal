import { SectionLabel } from '@/components/ui/SectionLabel';
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
    <div className="flex flex-col gap-4 border-4 border-ink bg-white/80 p-3">
      <div className="flex flex-col gap-2">
        <SectionLabel>Turn length</SectionLabel>
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
                'min-h-11 border-4 py-2 font-arcade text-[10px] transition-transform disabled:cursor-not-allowed',
                setup.roundDurationSeconds === seconds
                  ? 'translate-x-[2px] translate-y-[2px] border-flare bg-selected-sky text-black shadow-none'
                  : cn(
                      'border-ink bg-sky-500 text-white shadow-[2px_2px_0px_0px_#381a41]',
                      'disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
                    ),
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Categories ({chosen})</SectionLabel>

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
                  'min-h-11 border-4 px-3 py-2 font-arcade text-[9px] transition-transform disabled:cursor-not-allowed',
                  isChosen
                    ? 'translate-x-[2px] translate-y-[2px] border-flare bg-selected-green text-black shadow-none'
                    : cn(
                        'border-ink bg-green-500 text-white shadow-[2px_2px_0px_0px_#381a41]',
                        'disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
                      ),
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {chosen === 0 && (
          <p role="status" className="font-terminal text-sm text-rose-500">
            Pick at least 1 to start.
          </p>
        )}
      </div>
    </div>
  );
};
